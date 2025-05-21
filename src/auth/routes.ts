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
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req: Request, res: Response) => {
      console.log("[OAuth Callback] req.user:", req.user);
      console.log("[OAuth Callback] req.session:", req.session);
      
      // Determine the base frontend URL
      const baseFrontendUrl = process.env.NODE_ENV === "production"
        ? "https://urbancruise.vercel.app"
        : "http://localhost:3000";
      
      // Check if user has completed onboarding
      const user = req.user as any;
      const redirectPath = user?.onboardingCompleted ? "/dashboard" : "/sign-up";
      
      console.log(`[OAuth Callback] Redirecting to: ${baseFrontendUrl}${redirectPath}`);
      res.redirect(`${baseFrontendUrl}${redirectPath}`);
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
