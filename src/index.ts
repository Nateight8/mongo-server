import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import resolvers from "./graphql/resolvers/index.js";
import typeDefs from "./graphql/typeDefs/index.js";
import { db } from "./db/index.js";
import { PubSub } from "graphql-subscriptions";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import type { CorsOptions, CorsRequest } from "cors";
// --- Modular auth imports ---
import { setupPassport } from "./auth/passport.js";
import { registerAuthRoutes } from "./auth/routes.js";
import passport from "passport";
import session from "express-session";
import "dotenv/config";

interface MyContext {
  token?: String;
}

const isProduction = process.env.NODE_ENV === "production";

// --- CORS Configuration ---
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = [
  frontendUrl,
  "http://localhost:3000",
  "https://studio.apollographql.com",
  "https://journal-gamma-two.vercel.app"
].filter(Boolean) as string[];

console.log('Allowed CORS origins:', allowedOrigins);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin in CORS check - allowing');
      return callback(null, true);
    }

    // Check if the origin is in the allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      try {
        const allowedUrl = new URL(allowed);
        const originUrl = new URL(origin);
        return originUrl.hostname === allowedUrl.hostname || 
               originUrl.hostname.endsWith('.' + allowedUrl.hostname.replace('www.', ''));
      } catch (e) {
        console.error('Error checking CORS origin:', e);
        return false;
      }
    });

    if (isAllowed) {
      console.log(`CORS allowed for origin: ${origin}`);
      return callback(null, true);
    }

    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    console.error(msg);
    console.log('Allowed origins:', allowedOrigins);
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
import cookieParser from "cookie-parser";
app.use(cookieParser());

const httpServer = http.createServer(app);

// --- Auth setup ---
setupPassport();

// Session configuration
const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  name: "tradz.sid", // Custom session cookie name
  proxy: isProduction, // Trust the reverse proxy in production
  cookie: {
    httpOnly: true,
    secure: isProduction, // true in production (HTTPS)
    sameSite: isProduction ? "none" : "lax", // Required for cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    domain: isProduction ? 
      (process.env.COOKIE_DOMAIN || new URL(frontendUrl).hostname.replace('www.', '')) : 
      undefined, // Don't set domain in development
  },
  // Add store if you're using a session store in production
  // store: isProduction ? new (require('connect-pg-simple')(session))() : undefined,
  // Recommended to use a session store in production
  // store: new (require('connect-pg-simple')(session))()
};

// Trust first proxy in production
if (isProduction) {
  app.set('trust proxy', 1);
}

// Session middleware
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
