import { User as PassportUser } from "passport";
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    passport?: {
      user?: string; // User ID stored in session
    };
    // Add other custom session properties here if needed
  }
}

declare global {
  namespace Express {
    interface User extends PassportUser {
      id: string;
      email: string;
      name?: string;
      image?: string;
      // Add any other fields you expect
    }
  }
}

export {};
