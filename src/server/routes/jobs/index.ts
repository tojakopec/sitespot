import express, { Request, Response, NextFunction } from "express";
import { jobs } from "../../db/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

const router = express.Router();

// POST   /                # Create new job
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      companyId,
      workSiteId,
      managerId,
      title,
      description,
      requirements,
      salary,
      status,
      startDate,
      endDate,
    } = req.body;

    const [newJob] = await db
      .insert(jobs)
      .values({
        companyId,
        workSiteId,
        managerId,
        title,
        description,
        requirements,
        salary,
        status,
        startDate,
        endDate,
      })
      .returning();

    res.status(201).json(newJob);
  } catch (error) {
    next(error);
  }
});

// GET    /                # List all jobs
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const jobsList = await db.query.jobs.findMany({
      limit,
      offset,
    });

    res.status(200).json(jobsList);
  } catch (error) {
    next(error);
  }
});

// GET    /:id            # Get job details
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = Number(req.params.id);

    const job = await db.query.jobs.findFirst({ where: eq(jobs.id, jobId) });

    res.json(job);
  } catch (error) {
    next(error);
  }
});

// PUT    /:id            # Update job
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = Number(req.params.id);

    const {
      workSiteId,
      managerId,
      title,
      description,
      requirements,
      salary,
      status,
      startDate,
      endDate,
    } = req.body;

    const [updatedJob] = await db
      .update(jobs)
      .set({
        workSiteId,
        managerId,
        title,
        description,
        requirements,
        salary,
        status,
        startDate,
        endDate,
      })
      .where(eq(jobs.id, jobId))
      .returning();

    res.status(204).json(updatedJob);
  } catch (error) {
    next(error);
  }
});

// DELETE /:id            # Delete/cancel job
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobId = Number(req.params.id);
      const deletedJob = await db.delete(jobs).where(eq(jobs.id, jobId));

      res.status(204).json(deletedJob);
    } catch (error) {
      next(error);
    }
  }
);
