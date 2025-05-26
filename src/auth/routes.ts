import { Express, Request, Response, NextFunction } from "express";
import passport from "passport";

// Extend the session interface to include custom properties
declare module "express-session" {
  interface SessionData {
    testCounter?: number;
  }
}

export function registerAuthRoutes(app: Express) {
  // Google OAuth login
  app.get(
    "/api/auth/google",
    (req, res, next) => {
      console.log("[Google Auth] Starting OAuth flow");
      console.log("[Google Auth] Session ID:", req.sessionID);
      next();
    },
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  // Google OAuth callback with enhanced session handling
  app.get(
    "/api/auth/google/callback",
    (req, res, next) => {
      console.log("[OAuth Callback] Route hit");
      console.log("[OAuth Callback] Pre-auth Session ID:", req.sessionID);
      console.log("[OAuth Callback] Headers:", req.headers);
      console.log("[OAuth Callback] Cookies:", req.cookies);
      
      // Ensure session is initialized
      if (!req.session) {
        console.error("[OAuth Callback] No session available");
      }
      
      next();
    },
    passport.authenticate("google", {
      failureRedirect: "/login",
      failureMessage: true,
      keepSessionInfo: true, // Keep session info during redirect
      session: true,
    }),
    (req: Request, res: Response, next: NextFunction) => {
      console.log("[OAuth Callback] Authentication successful");
      console.log("[OAuth Callback] Post-auth Session ID:", req.sessionID);
      console.log("[OAuth Callback] req.user:", req.user);
      console.log("[OAuth Callback] req.session:", req.session);

      if (!req.user) {
        console.error("[OAuth Callback] No user in session after authentication");
        return res.redirect('/login?error=no_user');
      }

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error("[OAuth Callback] Session regenerate error:", err);
          return next(err);
        }

        // Ensure user exists before logging in
        if (!req.user) {
          console.error('[OAuth Callback] No user to log in');
          return res.redirect('/login?error=no_user');
        }

        // Manually log in the user to establish the session
        req.logIn(req.user, (loginErr) => {
          if (loginErr) {
            console.error("[OAuth Callback] Login error:", loginErr);
            return next(loginErr);
          }

          // Force session save before redirect
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error("[OAuth Callback] Session save error:", saveErr);
              return next(saveErr);
            }

            console.log("[OAuth Callback] Session saved successfully");

            // Determine the base frontend URL
            let baseFrontendUrl = process.env.FRONTEND_URL || 
              (process.env.NODE_ENV === "production"
                ? "https://journal-gamma-two.vercel.app"
                : "http://localhost:3000");

            console.log("[OAuth Callback] Using frontend URL:", baseFrontendUrl);

            // Check if user has completed onboarding
            const user = req.user as any;
            const redirectPath = user?.onboardingCompleted
              ? "/dashboard"
              : "/authenticate";

            const redirectUrl = `${baseFrontendUrl}${redirectPath}`;
            console.log(`[OAuth Callback] Redirecting to: ${redirectUrl}`);

            // Set additional headers to help with session persistence
            res.set({
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
              'Surrogate-Control': 'no-store',
              'X-Content-Type-Options': 'nosniff',
              'X-Frame-Options': 'DENY',
              'X-XSS-Protection': '1; mode=block',
            });

            // Set a cookie with the session ID for the client to use
            res.cookie('connect.sid', req.sessionID, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
              maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
              path: '/',
              domain: process.env.NODE_ENV === 'production' ? '.tradz.app' : undefined,
            });

            res.redirect(307, redirectUrl);
          });
        });
      });
    }
  );

  // Logout with proper session cleanup
  app.get("/logout", (req: Request, res: Response, next: NextFunction) => {
    console.log("[Logout] Starting logout process");
    console.log("[Logout] Session ID:", req.sessionID);

    req.logout(function (err: any) {
      if (err) {
        console.error("[Logout] Error during logout:", err);
        return next(err);
      }

      // Destroy the session completely
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("[Logout] Session destroy error:", destroyErr);
        } else {
          console.log("[Logout] Session destroyed successfully");
        }

        // Clear the session cookie
        res.clearCookie("tradz.sid", {
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        const frontendUrl =
          process.env.NODE_ENV === "production"
            ? "https://journal-gamma-two.vercel.app" // Fixed: was urbancruise.vercel.app
            : "http://localhost:3000";

        console.log("[Logout] Redirecting to:", frontendUrl);
        res.redirect(frontendUrl);
      });
    });
  });

  // Enhanced debug endpoint
  app.get("/api/me", (req: Request, res: Response) => {
    console.log("[DEBUG] /api/me - Session ID:", req.sessionID);
    console.log("[DEBUG] /api/me - Session data:", req.session);
    console.log("[DEBUG] /api/me - User:", req.user);
    console.log("[DEBUG] /api/me - Cookies:", req.cookies);
    console.log("[DEBUG] /api/me - Is Authenticated:", req.isAuthenticated?.());

    res.json({
      success: true,
      user: req.user || null,
      isAuthenticated: req.isAuthenticated?.() || false,
      session: {
        id: req.sessionID,
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
      cookies: req.cookies,
      headers: {
        "x-forwarded-proto": req.headers["x-forwarded-proto"],
        "x-forwarded-host": req.headers["x-forwarded-host"],
        host: req.headers["host"],
        referer: req.headers["referer"],
        origin: req.headers["origin"],
        cookie: req.headers["cookie"] ? "Present" : "Not present",
      },
    });
  });

  // Additional debug endpoint for session testing
  app.get("/api/session-test", (req: Request, res: Response) => {
    console.log("[Session Test] Current session:", req.session);
    console.log("[Session Test] Session ID:", req.sessionID);
    console.log("[Session Test] User:", req.user);

    // Test session persistence by setting a test value
    if (!req.session.testCounter) {
      req.session.testCounter = 1;
    } else {
      req.session.testCounter++;
    }

    res.json({
      message: "Session test endpoint",
      sessionId: req.sessionID,
      testCounter: req.session.testCounter,
      user: req.user || null,
      isAuthenticated: req.isAuthenticated?.() || false,
      sessionExists: !!req.session,
      passportData: req.session?.passport,
    });
  });
}
