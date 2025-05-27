import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema/index.js";
import { PubSub } from "graphql-subscriptions";

export interface UserSession {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  // Add other user fields as needed
}

// User type that will be available in the GraphQL context
export interface ContextUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

import { Request, Response } from "express";

export interface GraphqlContext {
  db: PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
  };
  user: ContextUser | null;
  pubsub: PubSub;
  req: Request;
  res: Response;
}

// Input type for createUser and updateUser

// If you need a Session type, define it here for Passport.js:
export interface Session {
  id: string;
  email: string;
  name?: string;
  image?: string;
  // Add any other fields you expect from the user object
}
