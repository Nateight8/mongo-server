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

// --- SIMPLIFIED CORS FOR DEV ---
const corsOptions: CorsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
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
  cookie: {
    httpOnly: true,
    secure: isProduction, // true in production (HTTPS)
    sameSite: isProduction ? "none" : "lax", // Required for cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    domain: isProduction ? ".urbancruise.vercel.app" : "localhost",
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

        // Log the session ID and user ID for debugging
        console.log("[GraphQL context] Session ID:", req.sessionID);
        console.log("[GraphQL context] User ID:", user?.id);

        return {
          db,
          user, // Pass the user object directly
          pubsub,
        };
      },
    })
  );

  const port = process.env.PORT || 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));

  console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  console.log(`🔌 WebSocket server ready at ws://localhost:${port}/graphql/ws`);
}

startServer();
