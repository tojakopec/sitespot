import { Request, Response, NextFunction } from "express";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId || !req.session.userRole) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    if (!roles.includes(req.session.userRole)) {
      res.status(403).json({ error: "Insufficient permissions." });
      return;
    }
    next();
  };
};
