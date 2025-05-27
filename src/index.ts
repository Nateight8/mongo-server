import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express, { NextFunction } from "express";
import http from "http";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import { PubSub } from "graphql-subscriptions";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { fileURLToPath } from "url";
import { dirname } from "path";
import "dotenv/config";

// Application imports
import resolvers from "./graphql/resolvers/index.js";
import typeDefs from "./graphql/typeDefs/index.js";
import { db } from "./db/index.js";
import { setupPassport } from "./auth/passport.js";
import { registerAuthRoutes } from "./auth/routes.js";

// ES module equivalent of __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import type { GraphqlContext } from "./types/types.utils.js";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";

// Extend the GraphqlContext to use the correct database type
interface MyContext extends Omit<GraphqlContext, "db"> {
  token?: string;
  db: NeonHttpDatabase<typeof import("./db/schema/index.js")> & {
    $client: any; // We'll type this more specifically if needed
  };
}

const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = [
  ...process.env
    .CORS_ORIGINS!.split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
  "https://studio.apollographql.com", // Allow Apollo Sandbox
  "http://localhost:4000", // Allow local development
  "http://localhost:3000", // Allow local frontend
];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin); // Add logging for debugging
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["set-cookie"],
};

const app = express();

// Trust proxy in production for correct cookie handling
if (isProduction) {
  app.set("trust proxy", 1);
}

const httpServer = http.createServer(app);

// Body parsers - must be before any other middleware that reads the body
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session configuration
const cookieOptions: session.CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  domain: isProduction ? ".tradz.app" : "localhost",
  path: "/",
};

const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: cookieOptions,
};

// Cookie parser middleware
// import cookieParser from 'cookie-parser';

// --- Auth setup ---
setupPassport();
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware to log session info
app.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log("Session:", req.session);
  console.log("User:", req.user);
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
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

// Create WebSocket server handler
const serverCleanup = useServer(
  {
    schema,
    context: async (ctx) => {
      // Get session from connection params if available
      const session = ctx.connectionParams?.session || null;
      return { session, db, pubsub };
    },
  },
  // @ts-ignore - Type mismatch between ws and graphql-ws
  wsServer
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
    await server.start();

    // Apply Apollo Server middleware with proper context
    app.use(
      "/graphql",
      cors(corsOptions),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req, res }) => {
          return {
            req,
            res,
            user: req.user
              ? {
                  id: req.user.id,
                  email: req.user.email,
                  name: req.user.name,
                  image: req.user.image,
                }
              : null,
            // @ts-ignore - We know the types don't match exactly but they're compatible
            db,
            pubsub,
          };
        },
      } as const)
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
