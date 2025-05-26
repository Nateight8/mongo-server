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
      console.log("[OAuth Callback] Query params:", req.query);
      console.log("[OAuth Callback] Session ID:", req.sessionID);
      next();
    },
    (req, res, next) => {
      passport.authenticate('google', (err: any, user: any, info: any) => {
        console.log('[OAuth Callback] Authentication result:', { 
          err, 
          user: user ? 'User found' : 'No user',
          info,
          session: req.session
        });

        if (err) {
          console.error('[OAuth Callback] Error during authentication:', err);
          return res.redirect(`/login?error=${encodeURIComponent(err.message || 'Authentication failed')}`);
        }
        
        if (!user) {
          console.error('[OAuth Callback] No user returned from authentication');
          return res.redirect('/login?error=authentication_failed');
        }

        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error('[OAuth Callback] Error during login:', loginErr);
            return res.redirect('/login?error=login_failed');
          }

          // Determine the base frontend URL
          let baseFrontendUrl = process.env.FRONTEND_URL;
          
          if (!baseFrontendUrl) {
            console.log('[OAuth Callback] NODE_ENV:', process.env.NODE_ENV);
            baseFrontendUrl = process.env.NODE_ENV === 'production'
              ? 'https://journal-gamma-two.vercel.app'
              : 'http://localhost:3000';
          }
          
          console.log('[OAuth Callback] Using frontend URL:', baseFrontendUrl);

          // Check if user has completed onboarding
          const redirectPath = user.onboardingCompleted
            ? "/dashboard"
            : "/authenticate";

          console.log(`[OAuth Callback] Redirecting to: ${baseFrontendUrl}${redirectPath}`);
          return res.redirect(`${baseFrontendUrl}${redirectPath}`);
        });
      })(req, res, next);
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
