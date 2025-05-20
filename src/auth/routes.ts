import { Express, Request, Response, NextFunction } from "express";
import passport from "passport";

export function registerAuthRoutes(app: Express) {
  // Google OAuth login
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  // Google OAuth callback
  app.get(
    "/api/auth/google/callback",
    (req, res, next) => {
      console.log("[OAuth Callback] Route hit");
      next();
    },
    passport.authenticate("google", { failureRedirect: "/" }),
    (req: Request, res: Response) => {
      console.log("[OAuth Callback] req.user:", req.user);
      console.log("[OAuth Callback] req.session:", req.session);
      // Always redirect to frontend root after authentication
      const frontendUrl =
        process.env.NODE_ENV === "production"
          ? "https://urbancruise.vercel.app/"
          : "http://localhost:3000/";
      res.redirect(frontendUrl);
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
          ? "https://urbancruise.vercel.app"
          : "http://localhost:3000";
      res.redirect(frontendUrl);
    });
  });

  // Debug endpoint to check session/user
  app.get("/api/me", (req: Request, res: Response) => {
    res.json({ user: req.user, session: req.session });
  });
}
