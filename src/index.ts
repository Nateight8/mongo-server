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

// ES module equivalent of __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MyContext {
  token?: String;
}

const isProduction = process.env.NODE_ENV === "production";

// --- CORS Configuration ---
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const serverUrl = process.env.RENDER_EXTERNAL_URL || 
  (process.env.RENDER_INSTANCE_ID ? 
    `https://${process.env.RENDER_INSTANCE_ID}.onrender.com` : 
    'http://localhost:4000');

const allowedOrigins = [
  frontendUrl,
  serverUrl,
  "http://localhost:3000",
  "http://localhost:4000",
  "https://studio.apollographql.com",
  "https://journal-gamma-two.vercel.app",
];

console.log("Allowed CORS origins:", allowedOrigins);
console.log("Server URL:", serverUrl);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.some((allowed) =>
        origin.endsWith(new URL(allowed).hostname)
      )
    ) {
      return callback(null, true);
    }

    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    console.error(msg);
    return callback(new Error(msg), false);
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
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
    domain: isProduction
      ? process.env.COOKIE_DOMAIN || 
        new URL(process.env.RENDER_EXTERNAL_URL || `http://${process.env.RENDER_INSTANCE_ID}.onrender.com`).hostname
      : "localhost",
  },
  // Recommended to use a session store in production
  // store: new (require('connect-pg-simple')(session))()
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
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

// Global flag to prevent multiple server starts
let serverStarted = false;
let serverStarting = false;

async function startServer() {
  // Prevent multiple server starts
  if (serverStarted) {
    console.log("Server already started, skipping...");
    return httpServer;
  }

  if (serverStarting) {
    console.log("Server is already starting, waiting...");
    // Wait for the other startup to complete
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

    // Apply GraphQL middleware
    app.use(
      "/graphql",
      cors(corsOptions),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req, res }) => {
          console.log("[GraphQL context] Session ID:", req.sessionID);
          console.log(
            "[GraphQL context] User:",
            req.user ? "Authenticated" : "Not authenticated"
          );

          return {
            db,
            user: req.user || null,
            pubsub,
            req,
            res,
          };
        },
      })
    );

    // Health check endpoint
    app.get("/health", (req, res) => {
      res
        .status(200)
        .json({ status: "ok", timestamp: new Date().toISOString() });
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
    return httpServer;
  } catch (error) {
    console.error("Failed to start server:", error);
    serverStarting = false;
    await stopServer();
    throw error; // Re-throw instead of process.exit to allow proper error handling
  }
}

// Stop the server gracefully
async function stopServer() {
  try {
    console.log("Stopping server...");

    // Close WebSocket server if it exists
    if (serverCleanup) {
      await serverCleanup.dispose();
      console.log("WebSocket server closed");
    }

    // Close HTTP server if it's running
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

// Export for testing or programmatic usage (ES module style)
export { app, startServer, stopServer };
