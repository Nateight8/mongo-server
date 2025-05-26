import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express, { type Request, Response, NextFunction } from 'express';
import cors, { type CorsOptions } from 'cors';
import { createServer, type Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';
import session from 'express-session';
import pgSession = require('connect-pg-simple');
import type { PoolConfig } from 'pg';
import { Pool } from 'pg';
import { setupPassport } from './auth/passport.js';
import { registerAuthRoutes } from './auth/routes.js';
import typeDefs from './graphql/typeDefs/index.js';
import resolvers from './graphql/resolvers/index.js';
import { db } from './db/index.js';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

type CorsRequest = Request & { origin?: string };

interface MyContext {
  token?: String;
}

const isProduction = process.env.NODE_ENV === "production";

// --- CORS Configuration ---
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// Function to normalize URLs for comparison
const normalizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Remove trailing slashes and convert to lowercase for comparison
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.port ? `:${urlObj.port}` : ''}`.toLowerCase();
  } catch (e) {
    console.error('Error normalizing URL:', url, e);
    return url.toLowerCase();
  }
};

// Define allowed origins
const allowedOrigins = [
  frontendUrl,
  "http://localhost:3000",
  "https://studio.apollographql.com",
  "https://journal-gamma-two.vercel.app"
].filter(Boolean).map(normalizeUrl);

console.log('Allowed CORS origins:', allowedOrigins);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin in CORS check - allowing');
      return callback(null, true);
    }

    // Normalize the incoming origin for comparison
    const normalizedOrigin = normalizeUrl(origin);
    
    // Check if the origin is in the allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      try {
        const allowedUrl = new URL(allowed);
        const originUrl = new URL(normalizedOrigin);
        
        // Check exact match first
        if (normalizedOrigin === allowed) return true;
        
        // Check if it's a subdomain or matches the main domain
        const allowedHost = allowedUrl.hostname.replace('www.', '');
        const originHost = originUrl.hostname.replace('www.', '');
        
        return originHost === allowedHost || 
               originHost.endsWith('.' + allowedHost);
      } catch (e) {
        console.error('Error checking CORS origin:', e);
        return false;
      }
    });

    if (isAllowed) {
      console.log(`CORS allowed for origin: ${normalizedOrigin}`);
      return callback(null, true);
    }

    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${normalizedOrigin}`;
    console.error(msg);
    console.log('Allowed origins:', allowedOrigins);
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token'],
  exposedHeaders: ['set-cookie'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false,
  maxAge: 600 // Cache preflight for 10 minutes
};

const app = express();

// Trust proxy in production for correct cookie handling
if (isProduction) {
  app.set("trust proxy", 1);
}

// Add cookie parser middleware
app.use(cookieParser());

const httpServer = createServer(app);

// --- Auth setup ---
setupPassport();

// Session store configuration
let sessionStore: session.Store | undefined;

if (isProduction) {
  try {
    // In production, use PostgreSQL for session storage
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    });
    
    // Check if the session table exists
    const checkTableExists = async () => {
      try {
        await pool.query('SELECT 1 FROM user_sessions LIMIT 1');
        console.log('Session table already exists');
        return true;
      } catch (err) {
        console.log('Session table does not exist or error checking:', err);
        return false;
      }
    };

    // Create the session store with type assertion
    const PgStore = (pgSession as any)(session);
    
    // Create the session store instance
    sessionStore = new PgStore({
      pool: pool,
      tableName: 'user_sessions',
      createTableIfMissing: false, // Set to false since we're checking manually
      pruneSessionInterval: 60 * 60, // Prune expired sessions every hour
    });

    // Check if table exists, if not, create it
    const tableExists = await checkTableExists();
    if (!tableExists) {
      console.log('Creating session table...');
      try {
        await (sessionStore as any).createTableIfNotExists();
        console.log('Session table created successfully');
      } catch (createError) {
        // If the error is about the table already existing, we can ignore it
        if (!(createError as any).message?.includes('already exists')) {
          console.error('Error creating session table:', createError);
          throw createError;
        }
        console.log('Session table already exists (from error check)');
      }
    }
    
    console.log('Using PostgreSQL for session storage');
  } catch (error) {
    console.error('Failed to initialize PostgreSQL session store:', error);
    // Fall back to memory store in case of error
    console.warn('Falling back to MemoryStore due to PostgreSQL initialization error');
  }
} else {
  // In development, use memory store (not for production)
  console.warn('Using MemoryStore for sessions - not suitable for production');
}

// Cookie domain configuration
const getCookieDomain = () => {
  // In development, don't set domain
  if (!isProduction) {
    console.log('Running in development mode - not setting cookie domain');
    return undefined;
  }
  
  // If COOKIE_DOMAIN is explicitly set, use it
  if (process.env.COOKIE_DOMAIN) {
    console.log('Using COOKIE_DOMAIN from environment:', process.env.COOKIE_DOMAIN);
    return process.env.COOKIE_DOMAIN;
  }
  
  try {
    console.log('Frontend URL:', frontendUrl);
    const url = new URL(frontendUrl);
    const hostname = url.hostname;
    
    console.log('Extracted hostname:', hostname);
    
    // For IP addresses, return undefined (no domain)
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      console.log('IP address detected, not setting domain');
      return undefined;
    }
    
    // For localhost, return undefined
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      console.log('Localhost detected, not setting domain');
      return undefined;
    }
    
    // For production, use the domain without subdomains
    const parts = hostname.split('.');
    let domain;
    
    if (parts.length > 2) {
      // For domains like sub.example.com, use .example.com
      domain = `.${parts.slice(-2).join('.')}`;
    } else {
      // For domains like example.com
      domain = hostname;
    }
    
    console.log('Determined cookie domain:', domain);
    return domain;
  } catch (e) {
    console.error('Error determining cookie domain:', e);
    return undefined;
  }
};

// Get the cookie domain
const cookieDomain = getCookieDomain();
console.log('Final cookie domain:', cookieDomain);

// Session middleware configuration
const sessionConfig: session.SessionOptions = {
  secret: process.env.AUTH_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    secure: isProduction, // true in production (HTTPS)
    sameSite: isProduction ? "none" : "lax", // Required for cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    domain: cookieDomain,
  },
};

// Trust first proxy in production
if (isProduction) {
  app.set('trust proxy', 1);
}

// Apply session middleware
app.use(session(sessionConfig));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Log session info for debugging
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('User authenticated:', req.isAuthenticated());
  next();
});

// Register auth routes
registerAuthRoutes(app);

// Create a PubSub instance
const pubsub = new PubSub();

// Start the server
httpServer.listen({ port: 4000 }, () => {
  console.log(`🚀 Server ready at http://localhost:4000`);
});

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Set up WebSocket server for subscriptions
const wsServer: WebSocketServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

// Set up WebSocket server
const serverCleanup = useServer(
  {
    schema,
    context: async (ctx: { connectionParams?: { session?: any } }) => {
      // Get session from connection params if available
      const session = ctx.connectionParams?.session || null;
      return { session, db, pubsub };
    },
  },
  wsServer as any // Type assertion to fix type error
);

// Create Apollo Server
const server = new ApolloServer<MyContext>({
  schema,
  csrfPrevention: true,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

// Only apply CORS, express.json, etc. to /graphql
async function startServer() {
  await server.start();

  app.use(
    "/graphql",
    cors(corsOptions),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        console.log("[GraphQL context] req.session:", req.session);
        console.log("[GraphQL context] req.user:", req.user);

        // Get the user from the session
        const user = req.user || null;

        return {
          db,
          user, // Pass the user object directly
          pubsub,
          req,
          res,
        };
      },
    })
  );

  const port = process.env.PORT || 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));

  const serverUrl = isProduction
    ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME || `localhost:${port}`}`
    : `http://localhost:${port}`;
  console.log(`🚀 Server ready at ${serverUrl}/graphql`);
  console.log(
    `🔌 WebSocket server ready at ${serverUrl.replace("http", "ws")}/graphql/ws`
  );
}

startServer();
