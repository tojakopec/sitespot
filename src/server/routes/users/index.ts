import express from "express";
import type { Response, Request, NextFunction } from "express";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../../utils/passwordHash";
import companiesRouter from "./companies";
import workersRouter from "./workers";
import managersRouter from "./managers";
import { validateRequest } from "../../middleware/validateRequest";
import { createUserSchema, updateUserSchema } from "../../validation/users";
import { paginationSchema } from "../../validation/pagination";
import { idParamSchema } from "../../validation/idParam";
import { requireAuth, requireRole } from "../../middleware/requireAuth";

const router = express.Router();

router.use("/companies", companiesRouter);
router.use("/workers", workersRouter);
router.use("/managers", managersRouter);

// GET all users (with pagination)
router.get(
  "/",
  requireAuth,
  validateRequest({ query: paginationSchema.shape.query }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = req.query;

      const usersList = await db.query.users.findMany({
        limit: Number(limit) || 10,
        offset: Number(offset) || 0,
        columns: {
          passwordHash: false,
        },
      });
      res.status(200).json(usersList);
    } catch (error) {
      next(error);
    }
  }
);

// GET user by id
router.get(
  "/:id",
  requireAuth,
  validateRequest({ params: idParamSchema.shape.params }),
  async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = Number(req.params.id);

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          passwordHash: false,
        },
        with: {
          workerProfile: true,
          company: true,
          managerProfile: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: "User not found." });
        return;
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// POST new user
router.post(
  "/",
  validateRequest({ body: createUserSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(`Request body: ${req.body}`);
    try {
      const { role, email, password, firstName, lastName, phone, avatarUrl } =
        req.body;

      const [newUser] = await db
        .insert(users)
        .values({
          role,
          email,
          passwordHash: hashPassword(password),
          firstName,
          lastName,
          phone,
          avatarUrl,
        })
        .returning();

      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }
);

// PUT user by id (update user)
router.put(
  "/:id",
  // TODO: Add requireOwner(?) so user can only be updated by that user
  validateRequest({
    body: updateUserSchema,
    params: idParamSchema.shape.params,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.id);
      const { firstName, lastName, phone, avatarUrl, email } = req.body;

      const [updatedUser] = await db
        .update(users)
        .set({
          firstName,
          lastName,
          phone,
          avatarUrl,
          email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        res.status(404).json({ error: "User not found." });
        return;
      }
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  requireRole(["admin"]),
  validateRequest({ params: idParamSchema.shape.params }),
  async (req, res, next) => {
    try {
      const userId = Number(req.params.id);

      const [deactivatedUser] = await db
        .update(users)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      if (!deactivatedUser) {
        res.status(404).json({ error: "User not found." });
      }

      res.json({ message: "User deactivated successfully." });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/reactivate/:id",
  requireRole(["admin"]),
  validateRequest({ params: idParamSchema.shape.params }),
  async (req, res, next) => {
    try {
      const userId = Number(req.params.id);

      const [reactivatedUser] = await db
        .update(users)
        .set({
          isActive: true,
        })
        .where(eq(users.id, userId))
        .returning();

      if (!reactivatedUser) {
        res.status(404).json({ error: "User not found." });
      }
      res.json({ message: "User reactivated successfully." });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
