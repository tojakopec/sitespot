import express, { Request, Response, NextFunction } from "express";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { contracts } from "../../db/schema";

const router = express.Router();

// GET    /                # List contracts
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const contractsList = await db.query.contracts.findMany({ limit, offset });
    res.status(200).json(contractsList);
  } catch (error) {
    next(error);
  }
});

// POST   /                # Create contract
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      jobId,
      workerId,
      managerId,
      status,
      startDate,
      endDate,
      terms,
      rate,
    } = req.body;

    const [newContract] = await db
      .insert(contracts)
      .values({
        jobId,
        workerId,
        managerId,
        status,
        startDate,
        endDate,
        terms,
        rate,
      })
      .returning();

    res.status(200).json(newContract);
  } catch (error) {
    next(error);
  }
});
// GET    /:id            # Get contract details
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contractId = Number(req.params.id);

    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId),
    });

    res.status(200).json(contract);
  } catch (error) {
    next(error);
  }
});
// PUT    /:id            # Update contract
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contractId = Number(req.params.id);
    const { startDate, endDate, terms, rate } = req.body;

    const updatedContract = await db
      .update(contracts)
      .set({ startDate, endDate, terms, rate })
      .where(eq(contracts.id, contractId));

    res.status(204).json(updatedContract);
  } catch (error) {
    next(error);
  }
});

// PUT    /:id/status     # Update contract status
router.put(
  "/:id/status",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contractId = Number(req.params.id);
      const { status } = req.body;

      const updatedContract = await db
        .update(contracts)
        .set({ status })
        .where(eq(contracts.id, contractId));

      res.status(204).json(updatedContract);
    } catch (error) {
      next(error);
    }
  }
);
