import express, { Request, Response, NextFunction } from "express";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { jobApplications } from "../../db/schema";

const router = express.Router({ mergeParams: true });

// GET    /:id/applications     # List applications for a job
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = Number(req.params.id);
    const applicationsForJob = await db.query.jobApplications.findMany({
      where: eq(jobApplications.jobId, jobId),
    });

    res.status(200).json(applicationsForJob);
  } catch (error) {
    next(error);
  }
});

// POST   /:id/applications     # Submit application
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobId = Number(req.params.id);

    const { workerId, status, proposedRate, coverLetter } = req.body;

    const [newApplication] = await db
      .insert(jobApplications)
      .values({ jobId, workerId, status, proposedRate, coverLetter })
      .returning();

    res.status(200).json(newApplication);
  } catch (error) {
    next(error);
  }
});

// GET    /:id/applications/:appId  # Get application details
router.get(
  "/:appId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobId = Number(req.params.id);
      const appId = Number(req.params.appId);

      const applicationDetails = await db.query.jobApplications.findFirst({
        where:
          eq(jobApplications.jobId, jobId) && eq(jobApplications.id, appId),
      });

      res.status(200).json(applicationDetails);
    } catch (error) {
      next(error);
    }
  }
);

// PUT    /:id/applications/:appId  # Update application status
router.put(
  "/:appId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobId = Number(req.params.id);
      const appId = Number(req.params.appId);
      const { status } = req.body;

      const updatedApplication = await db
        .update(jobApplications)
        .set({ status })
        .where(
          eq(jobApplications.jobId, jobId) && eq(jobApplications.id, appId)
        )
        .returning();

      res.status(204).json(updatedApplication);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
