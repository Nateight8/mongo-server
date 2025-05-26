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
      // Priority: FRONTEND_URL env var > NODE_ENV based URL > default localhost
      let baseFrontendUrl = process.env.FRONTEND_URL;

      if (!baseFrontendUrl) {
        console.log("[OAuth Callback] NODE_ENV:", process.env.NODE_ENV);
        baseFrontendUrl =
          process.env.NODE_ENV === "production"
            ? "https://journal-gamma-two.vercel.app"
            : "http://localhost:3000";
      }

      console.log("[OAuth Callback] Using frontend URL:", baseFrontendUrl);

      // Check if user has completed onboarding
      const user = req.user as any;
      const redirectPath = user.onboardingCompleted
        ? "/dashboard"
        : "/authenticate";

      console.log(
        `[OAuth Callback] Redirecting to: ${baseFrontendUrl}${redirectPath}`
      );
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
    console.log("[DEBUG] /api/me - Session ID:", req.sessionID);
    console.log("[DEBUG] /api/me - Session data:", req.session);
    console.log("[DEBUG] /api/me - User:", req.user);
    console.log("[DEBUG] /api/me - Cookies:", req.cookies);
    console.log("[DEBUG] /api/me - Headers:", req.headers);

    res.json({
      user: req.user,
      session: req.session,
      cookies: req.cookies,
      sessionId: req.sessionID,
      headers: {
        "x-forwarded-proto": req.headers["x-forwarded-proto"],
        "x-forwarded-host": req.headers["x-forwarded-host"],
        host: req.headers["host"],
        referer: req.headers["referer"],
        origin: req.headers["origin"],
      },
    });
  });
}
