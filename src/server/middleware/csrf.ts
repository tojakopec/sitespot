import { doubleCsrf } from "csrf-csrf";
import { Request, Response, NextFunction } from "express";

// Configuration for doubleCsrf
export const { generateToken, doubleCsrfProtection, validateRequest } =
  doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET ?? "ADD_SECRET_TO_ENV",
    cookieName: "x-csrf-token", // The name of the cookie to be used
    cookieOptions: {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      signed: process.env.COOKIE_SECRET ? true : false, // Use signed cookies if COOKIE_SECRET is available
    },
    size: 64, // The size of the generated tokens in bits
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getTokenFromRequest: (req) => req.headers["x-csrf-token"] as string,
  });

// Middleware to generate and provide a CSRF token
export const csrfTokenRoute = (req: Request, res: Response) => {
  const csrfToken = generateToken(req, res);
  res.json({ csrfToken });
};

// Error handler for CSRF errors
export const handleCSRFError = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.name === "CSRFTokenError") {
    console.error("CSRF Error:", err);
    res.status(403).json({
      error: "Invalid CSRF token. Please try again.",
    });
    return;
  }
  next(err);
};
