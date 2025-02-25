import express, { Request, Response, NextFunction } from "express";
import { db } from "../../db";
import { managerProfiles, workSites } from "../../db/schema";
import { eq } from "drizzle-orm";
import checkSiteExists from "../../utils/siteExists";

const router = express.Router();

// GET    /                # List work sites
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const sitesList = await db.query.workSites.findMany({
      limit,
      offset,
    });

    res.json(sitesList);
  } catch (error) {
    next(error);
  }
});

// POST   /                # Create work site
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      companyId,
      name,
      address,
      status,
      startDate,
      endDate,
      description,
    } = req.body;

    const [newSite] = await db
      .insert(workSites)
      .values({
        companyId,
        name,
        address,
        status,
        startDate,
        endDate,
        description,
      })
      .returning();

    res.status(201).json(newSite);
  } catch (error) {
    next(error);
  }
});

// GET    /:id            # Get site details
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workSiteId = Number(req.params.id);

    const site = await db.query.workSites.findFirst({
      where: eq(workSites.id, workSiteId),
    });

    if (!site) {
      res.status(404).json({ error: "Worksite not found." });
    }
    res.json(site);
  } catch (error) {
    next(error);
  }
});

// PUT    /:id            # Update site
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workSiteId = Number(req.params.id);
    const {
      companyId,
      name,
      address,
      status,
      startDate,
      endDate,
      description,
    } = req.body;
    if (!(await checkSiteExists(workSiteId))) {
      res.status(404).json({ error: "Worksite not found." });
      return;
    }
    const site = await db
      .update(workSites)
      .set({
        companyId,
        name,
        address,
        status,
        startDate,
        endDate,
        description,
      })
      .where(eq(workSites.id, workSiteId))
      .returning();

    res.status(204).json(site);
  } catch (error) {
    next(error);
  }
});

// DELETE /:id            # Delete site
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workSiteId = Number(req.params.id);

      const deletedSite = await db
        .delete(workSites)
        .where(eq(workSites.id, workSiteId))
        .returning();

      res.status(204).json(deletedSite);
    } catch (error) {
      next(error);
    }
  }
);
// GET    /:id/managers    # List managers at site
router.get(
  "/:id/managers",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workSiteId = Number(req.params.id);

      if (!(await checkSiteExists(workSiteId))) {
        res.status(404).json({ error: "Worksite not found." });
      }

      const [managersOnSite] = await db.query.managerProfiles.findMany({
        where: eq(managerProfiles.workSiteId, workSiteId),
      });

      res.status(200).json(managersOnSite);
    } catch (error) {
      next(error);
    }
  }
);
// POST   /:id/managers    # Assign manager to site
router.post(
  "/:id/managers",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workSiteId = Number(req.params.id);
      const managerId = Number(req.body);

      if (!(workSiteId && managerId)) {
        res
          .status(400)
          .json({ error: "Required params: workSiteId and managerId." });
      }

      const assignedManager = await db
        .update(managerProfiles)
        .set({ workSiteId })
        .where(eq(managerProfiles.id, managerId))
        .returning();

      res.status(200).json(assignedManager);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
