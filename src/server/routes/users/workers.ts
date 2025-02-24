import express, { Request, Response, NextFunction } from "express";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { workerProfiles } from "../../db/schema";
import { checkUserExists } from "../../utils/userExists";
import { checkWorkerExists } from "../../utils/workerExists";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const workersList = await db.query.workerProfiles.findMany({
      limit,
      offset,
    });
    res.json(workersList);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      userId,
      skills,
      experience,
      availability,
      preferredLocation,
      ratePerHour,
      bio,
      certifications,
      isPublic,
    } = req.body;

    if (!userId) {
      res.status(400).json({ error: "Required param: userId" });
      return;
    }
    if (!(await checkUserExists(userId))) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (await checkWorkerExists(userId)) {
      res.status(409).json({ error: "User already registered as worker." });
      return;
    }

    const [newWorker] = await db
      .insert(workerProfiles)
      .values({
        userId,
        skills,
        experience,
        availability,
        preferredLocation,
        ratePerHour,
        bio,
        certifications,
        isPublic,
      })
      .returning();

    res.status(201).json(newWorker);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);

    if (!(await checkUserExists(userId))) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    const worker = await db.query.workerProfiles.findFirst({
      where: eq(workerProfiles.userId, userId),
    });

    if (!worker) {
      res.status(404).json({
        error: `User with userId=${userId} is not registered as worker.`,
      });
    }

    res.json(worker);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);

    const {
      skills,
      experience,
      availability,
      preferredLocation,
      ratePerHour,
      bio,
      certifications,
      isPublic,
    } = req.body;

    if (!(await checkUserExists(userId))) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (!(await checkWorkerExists(userId))) {
      res.status(404).json({
        error: `User with userId=${userId} is not registered as worker.`,
      });
      return;
    }

    const [updatedWorker] = await db
      .update(workerProfiles)
      .set({
        skills,
        experience,
        availability,
        preferredLocation,
        ratePerHour,
        bio,
        certifications,
        isPublic,
      })
      .where(eq(workerProfiles.userId, userId))
      .returning();

    res.json(updatedWorker);
  } catch (error) {
    next(error);
  }
});

// # Worker-specific endpoints
// PUT    /workers/:id     # Update worker profile

export default router;
