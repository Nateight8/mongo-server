import { Express, Request, Response, NextFunction } from "express";
import passport from "passport";
import cors from "cors";

// Extend the session interface to include custom properties
declare module "express-session" {
  interface SessionData {
    testCounter?: number;
  }
}

// CORS configuration for auth routes
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://journal-gamma-two.vercel.app",
    "https://studio.apollographql.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export function registerAuthRoutes(app: Express) {
  // Session endpoint
  app.get(
    "/api/auth/session",
    cors(corsOptions),
    (req: Request, res: Response) => {
      if (req.user) {
        return res.json({ user: req.user });
      }
      return res.status(401).json({ message: "Not authenticated" });
    }
  );

  // Google OAuth login
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  // Google OAuth callback
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req: Request, res: Response) => {
      const frontendUrl = new URL(
        process.env.NODE_ENV === "production"
          ? "https://journal-gamma-two.vercel.app/onboard"
          : "http://localhost:3000/onboard"
      );

      // Add any query parameters you need
      if (req.user) {
        frontendUrl.searchParams.append("newUser", "true");
      }

      res.redirect(frontendUrl.toString());
    }
  );

  // Logout
  app.get("/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout(function (err: any) {
      if (err) {
        return next(err);
      }
      const frontendUrl =
        process.env.NODE_ENV === "production"
          ? "https://journal-gamma-two.vercel.app"
          : "http://localhost:3000";
      res.redirect(frontendUrl);
    });
  });

  // Debug endpoint to check session/user
  app.get("/api/me", cors(corsOptions), (req: Request, res: Response) => {
    res.json({ user: req.user, session: req.session });
  });
}
