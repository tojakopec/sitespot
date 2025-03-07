import express, { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "../utils/passwordHash";
import { loginLimiter } from "../middleware/rateLimiter";
import { sessionConfig } from "../config/session";
import jwt from "jsonwebtoken";
import { AuthPayload } from "@server/types/jwtPayload";

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET_KEY!;

const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let token = undefined;
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({ message: "Unauthorized (no JWT found)" });
    return;
  }

  jwt.verify(token, SECRET_KEY, (err, payload) => {
    const user = payload as AuthPayload;
    if (err) {
      res.status(403).json({ message: "Invalid token!" });
      return;
    }
    req.user = user;
    next();
  });
};
// LOGIN
router.post(
  "/login",
  loginLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, rememberMe } = req.body;
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        res
          .status(401)
          .json({ error: "Invalid credentials: User doesn't exist." });
        return;
      }

      const validPassword = await verifyPassword(password, user.passwordHash);

      if (!validPassword) {
        res.status(401).json({
          error: "Invalid credentials",
        });
        return;
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;
      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
        expiresIn: "24h",
      });

      if (rememberMe) {
        req.session.cookie.maxAge = sessionConfig.extendedDuration;
      }

      const { passwordHash, ...userWithoutPassword } = user;
      void passwordHash;
      res.json({ userWithoutPassword, token });
    } catch (error) {
      next(error);
    }
  }
);

// LOGOUT
router.post("/logout", async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

// GET current user
router.get(
  "/me",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session.userId) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.session.userId),
        columns: {
          passwordHash: false,
        },
      });
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// VALIDATE JWT
router.get("/validate", authenticateToken, (req: Request, res: Response) => {
  res.json({ valid: true, userId: req.session.userId });
});

export default router;
