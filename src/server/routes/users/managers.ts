import express, { Request, Response, NextFunction } from "express";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { managerProfiles, users } from "../../db/schema";
import { checkUserExists } from "../../utils/userExists";
import { checkCompanyExists } from "../../utils/companyExists";
import { requireAuth } from "../../middleware/requireAuth";
import { idParamSchema } from "../../validation/idParam";
import { updateManagerSchema } from "../../../shared/schemas/users";
import { validateRequest } from "../../middleware/validateRequest";
const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const managerList = await db.query.managerProfiles.findMany({
      limit,
      offset,
    });

    res.json(managerList);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, companyId, workSiteId, position, permissions } = req.body;

    if (!(userId && companyId)) {
      res.status(400).json({ error: "Required params: userId and companyId." });
      return;
    }

    if (!(await checkUserExists(userId))) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (!(await checkCompanyExists(companyId))) {
      res.status(404).json({ error: "Company not found." });
      return;
    }
    const result = await db.transaction(async (tx) => {
      const [newManager] = await tx
        .insert(managerProfiles)
        .values({
          userId,
          companyId,
          workSiteId,
          position,
          permissions,
        })
        .returning();

      const [updatedUser] = await tx
        .update(users)
        .set({
          role: "manager",
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      return { manager: newManager, user: updatedUser };
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);

    const manager = await db.query.managerProfiles.findFirst({
      where: eq(managerProfiles.userId, userId),
    });

    if (!manager) {
      res.status(404).json({ error: "Manager not found." });
    }
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:id",
  requireAuth,
  validateRequest({
    body: updateManagerSchema,
    params: idParamSchema.shape.params,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.id);
      const { companyId, workSiteId, position, permissions } = req.body;

      const [updatedManager] = await db
        .update(managerProfiles)
        .set({
          companyId,
          workSiteId,
          position,
          permissions,
        })
        .where(eq(managerProfiles.userId, userId))
        .returning();

      if (!updatedManager) {
        res.status(404).json({ error: "Manager not found." });
        return;
      }

      res.status(200).json(updatedManager);
      return;
    } catch (error) {
      next(error);
    }
  }
);

export default router;
