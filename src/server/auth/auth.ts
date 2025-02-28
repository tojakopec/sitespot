import express, { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import * as crypto from "node:crypto";
import { hashPassword } from "../utils/passwordHash";

const router = express.Router();

// LOGIN
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
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

      const validPassword = crypto.timingSafeEqual(
        Buffer.from(hashPassword(password)),
        Buffer.from(user.passwordHash)
      );
      console.log(validPassword);

      if (!validPassword) {
        res.status(401).json({
          hash: hashPassword(password),
          saved: user.passwordHash,
          isSame: hashPassword(password) == user.passwordHash,
          error: "Invalid credentials",
        });
        return;
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;

      const { passwordHash, ...userWithoutPassword } = user;
      void passwordHash;

      res.json(userWithoutPassword);
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

export default router;
