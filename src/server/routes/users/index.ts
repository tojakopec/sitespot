import express from "express";
import type { Response, Request, NextFunction } from "express";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../../utils/passwordHash";
import companiesRouter from "./companies";
import workersRouter from "./workers";
import managersRouter from "./managers";

const router = express.Router();

router.use("/companies", companiesRouter);
router.use("/workers", workersRouter);
router.use("/managers", managersRouter);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const usersList = await db.query.users.findMany({
      limit,
      offset,
      columns: {
        passwordHash: false,
      },
    });
    res.status(200).json(usersList);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:id",
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

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, email, password, firstName, lastName, phone } = req.body;

    const [newUser] = await db
      .insert(users)
      .values({
        role,
        email,
        passwordHash: hashPassword(password),
        firstName,
        lastName,
        phone,
      })
      .returning();

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);
    const { firstName, lastName, phone } = req.body;

    const [updatedUser] = await db
      .update(users)
      .set({
        firstName,
        lastName,
        phone,
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
});

router.delete("/:id", async (req, res, next) => {
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
});

router.put("/reactivate/:id", async (req, res, next) => {
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
});

export default router;
