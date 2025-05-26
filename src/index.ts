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
import { fileURLToPath } from "url";
import { dirname } from "path";
import cookieParser from "cookie-parser";

// ES module equivalent of __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MyContext {
  token?: String;
}

const isProduction = process.env.NODE_ENV === "production";

// --- CORS Configuration ---
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

const allowedOrigins = [
  frontendUrl,
  "http://localhost:3000",
  "http://localhost:4000",
  "https://studio.apollographql.com",
  "https://journal-gamma-two.vercel.app",
  "https://tradz-app-git-main-nateight8.vercel.app",
  // Add other Vercel preview URLs if needed
];

// Add all subdomains of vercel.app and netlify.app for development
const DEV_ALLOWED_DOMAINS = [
  '.vercel.app',
  '.netlify.app',
  '.onrender.com'
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    console.log("CORS Origin check for:", origin);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log("No origin, allowing");
      return callback(null, true);
    }

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      console.log("Origin allowed:", origin);
      return callback(null, true);
    }

    // Check for subdomains in production
    if (isProduction) {
      // Allow all subdomains of tradz.app
      const domainRegex = /^https?:\/\/([a-zA-Z0-9-]+\.)?tradz\.app(\/.*)?$/;
      if (domainRegex.test(origin)) {
        console.log("Subdomain allowed:", origin);
        return callback(null, true);
      }

      // Check for development domains
      const isDevDomain = DEV_ALLOWED_DOMAINS.some(domain => 
        origin.endsWith(domain)
      );
      
      if (isDevDomain) {
        console.log("Development domain allowed:", origin);
        return callback(null, true);
      }
    }

    console.log("Origin not allowed:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // This is important for cookies
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With", 
    "X-Requested-By",
    "Accept",
    "Origin",
    "Cookie",
    "Set-Cookie"
  ],
  exposedHeaders: [
    "Set-Cookie",
    "Date",
    "ETag"
  ]
};

const app = express();

// Trust proxy in production for correct cookie handling
if (isProduction) {
  app.set("trust proxy", 1);
}

// CRITICAL: Apply CORS before session middleware
app.use(cors(corsOptions));

// Add cookie parser middleware
app.use(cookieParser());

const httpServer = http.createServer(app);

// --- Auth setup ---
setupPassport();

// Session configuration with enhanced security and cross-origin support
const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: true, // Changed to true for better compatibility
  saveUninitialized: false,
  name: "tradz.sid",
  proxy: true, // Trust the proxy in production
  rolling: true, // Reset maxAge on every request
  cookie: {
    httpOnly: true,
    secure: true, // Must be true for SameSite=None
    sameSite: 'none', // Required for cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    path: "/",
    // No domain set to allow Vercel's domain to work
    partitioned: true, // Enable Partitioned cookies for Chrome 109+
  },
  // Use a store in production for better session management
  store: isProduction
    ? new (require("connect-mongo")(session))({
        mongoUrl: process.env.DATABASE_URL,
        ttl: 7 * 24 * 60 * 60, // 1 week in seconds
        autoRemove: 'native',
        autoRemoveInterval: 10, // Check every 10 minutes
      })
    : undefined,
};

// Trust first proxy in production
if (isProduction) {
  app.set('trust proxy', 1);
}

console.log("Session config:", {
  ...sessionConfig,
  secret: "[REDACTED]",
});

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Enhanced session debug middleware
app.use((req, res, next) => {
  if (
    req.path.includes("/auth") ||
    req.path.includes("/graphql") ||
    req.path.includes("/api")
  ) {
    console.log("[Session Debug] Path:", req.path);
    console.log("[Session Debug] Session ID:", req.sessionID);
    console.log("[Session Debug] Session exists:", !!req.session);
    console.log("[Session Debug] Session data:", {
      passport: req.session?.passport,
      cookie: req.session?.cookie
        ? {
            maxAge: req.session.cookie.maxAge,
            secure: req.session.cookie.secure,
            httpOnly: req.session.cookie.httpOnly,
            sameSite: req.session.cookie.sameSite,
          }
        : "No cookie",
    });
    console.log(
      "[Session Debug] User object:",
      req.user ? "Present" : "Not present"
    );
    console.log("[Session Debug] Is authenticated:", req.isAuthenticated?.());
    console.log(
      "[Session Debug] Request cookies:",
      req.headers.cookie ? "Present" : "Not present"
    );
    console.log(
      "[Session Debug] Set-Cookie header:",
      res.getHeaders()["set-cookie"] || "None"
    );
  }
  next();
});

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
      const session = ctx.connectionParams?.session || null;
      return { session, db, pubsub };
    },
  },
  wsServer as any
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

// Global flag to prevent multiple server starts
let serverStarted = false;
let serverStarting = false;

async function startServer() {
  if (serverStarted) {
    console.log("Server already started, skipping...");
    return httpServer;
  }

  if (serverStarting) {
    console.log("Server is already starting, waiting...");
    while (serverStarting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return httpServer;
  }

  try {
    serverStarting = true;
    console.log("Starting server...");
    console.log("Initializing application...");

    await server.start();
    console.log("Apollo Server started");

    // Apply GraphQL middleware - CORS already applied globally
    app.use(
      "/graphql",
      express.json(),
      expressMiddleware(server, {
        context: async ({ req, res }) => {
          console.log("[GraphQL Context] ===== REQUEST START =====");
          console.log("[GraphQL Context] Session ID:", req.sessionID);
          console.log("[GraphQL Context] Session exists:", !!req.session);
          console.log("[GraphQL Context] Session data:", {
            passport: req.session?.passport,
            cookie: req.session?.cookie
              ? {
                  maxAge: req.session.cookie.maxAge,
                  secure: req.session.cookie.secure,
                  httpOnly: req.session.cookie.httpOnly,
                  sameSite: req.session.cookie.sameSite,
                }
              : "No cookie config",
          });
          console.log(
            "[GraphQL Context] User object:",
            req.user
              ? {
                  id: req.user.id,
                  name: req.user.name,
                  email: req.user.email,
                }
              : "Not present"
          );
          console.log(
            "[GraphQL Context] Is authenticated:",
            req.isAuthenticated?.()
          );
          console.log("[GraphQL Context] Request headers:", {
            origin: req.headers.origin,
            referer: req.headers.referer,
            userAgent: req.headers["user-agent"]?.substring(0, 50) + "...",
            cookie: req.headers.cookie ? "Present" : "Not present",
          });
          console.log("[GraphQL Context] ===== REQUEST END =====");

          return {
            db,
            user: req.user || null,
            pubsub,
            req,
            res,
            isAuthenticated: req.isAuthenticated?.() || false,
          };
        },
      })
    );

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        session: {
          configured: !!req.session,
          sessionId: req.sessionID,
          authenticated: req.isAuthenticated?.() || false,
        },
      });
    });

    // Test endpoint to check session state
    app.get("/auth/status", (req, res) => {
      res.json({
        sessionId: req.sessionID,
        isAuthenticated: req.isAuthenticated?.() || false,
        user: req.user
          ? {
              id: req.user.id,
              name: req.user.name,
              email: req.user.email,
            }
          : null,
        session: {
          passport: req.session?.passport,
          cookie: req.session?.cookie
            ? {
                maxAge: req.session.cookie.maxAge,
                secure: req.session.cookie.secure,
                httpOnly: req.session.cookie.httpOnly,
                sameSite: req.session.cookie.sameSite,
              }
            : null,
        },
      });
    });

    // Start the HTTP server only if not already listening
    if (!httpServer.listening) {
      const port = process.env.PORT || 4000;
      await new Promise<void>((resolve, reject) => {
        httpServer.listen({ port }, (error?: Error) => {
          if (error) {
            reject(error);
            return;
          }

          const serverUrl = isProduction
            ? `https://${
                process.env.RENDER_EXTERNAL_HOSTNAME || `localhost:${port}`
              }`
            : `http://localhost:${port}`;

          console.log(`🚀 Server ready at ${serverUrl}/graphql`);
          console.log(
            `🔌 WebSocket ready at ${serverUrl.replace(
              "http",
              "ws"
            )}/graphql/ws`
          );
          console.log(`🩺 Health check at ${serverUrl}/health`);
          console.log(`🔐 Auth status at ${serverUrl}/auth/status`);

          serverStarted = true;
          serverStarting = false;
          resolve();
        });
      });
    } else {
      console.log("HTTP server already listening");
      serverStarted = true;
      serverStarting = false;
    }

    console.log("Application initialized successfully");
    console.log("CORS origins:", allowedOrigins);
    console.log("Session cookie config:", {
      secure: sessionConfig.cookie?.secure,
      sameSite: sessionConfig.cookie?.sameSite,
      httpOnly: sessionConfig.cookie?.httpOnly,
      maxAge: sessionConfig.cookie?.maxAge,
      domain: sessionConfig.cookie?.domain || "Not set (good for cross-origin)",
    });

    return httpServer;
  } catch (error) {
    console.error("Failed to start server:", error);
    serverStarting = false;
    await stopServer();
    throw error;
  }
}

// Stop the server gracefully
async function stopServer() {
  try {
    console.log("Stopping server...");

    if (serverCleanup) {
      await serverCleanup.dispose();
      console.log("WebSocket server closed");
    }

    if (httpServer && httpServer.listening) {
      await new Promise<void>((resolve) => {
        httpServer.close(() => {
          console.log("HTTP server closed");
          resolve();
        });
      });
    }

    serverStarted = false;
    serverStarting = false;
    console.log("Server stopped");
  } catch (error) {
    console.error("Error during server shutdown:", error);
    serverStarted = false;
    serverStarting = false;
  }
}

// Handle process termination
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM signal");
  await stopServer();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT signal");
  await stopServer();
  process.exit(0);
});

process.on("uncaughtException", async (error) => {
  console.error("Fatal error during server startup:", error);
  await stopServer();
  process.exit(1);
});

// ES Module way to check if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// Start the server if this file is run directly
if (isMainModule) {
  startServer().catch((error) => {
    console.error("Fatal error during server startup:", error);
    process.exit(1);
  });
}

export { app, startServer, stopServer };
