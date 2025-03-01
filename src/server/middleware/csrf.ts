import { doubleCsrf } from "csrf-csrf";
import { Request, Response, NextFunction } from "express";

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET ?? "ADD_SECRET_TO_ENV",
  cookieName: "x-csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getTokenFromRequest: (req) => req.headers["x-csrf-token"] as string,
});

export const attachCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers["x-csrf-token"]) {
    res.setHeader("x-csrf-token", generateToken(req, res));
  }
  next();
};

export const csrfProtection = doubleCsrfProtection;

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
