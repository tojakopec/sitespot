import express, { Request, Response, NextFunction } from "express";
import { db } from "../../db";
import { and, eq } from "drizzle-orm";
import { reviews } from "../../db/schema";

const router = express.Router();

// GET    /                # List reviews
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const reviewsList = await db.query.reviews.findMany({
      limit,
      offset,
    });

    res.json(reviewsList);
  } catch (error) {
    next(error);
  }
});

// POST   /                # Create review
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contractId, reviewerId, revieweeId, rating, type, comment } =
      req.body;

    const [newReview] = await db
      .insert(reviews)
      .values({ contractId, reviewerId, revieweeId, rating, type, comment })
      .returning();

    res.json(newReview);
  } catch (error) {
    next(error);
  }
});

// GET    /:id            # Get review details
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewId = Number(req.params.id);

    const review = await db.query.reviews.findFirst({
      where: eq(reviews.id, reviewId),
    });

    res.json(review);
  } catch (error) {
    next(error);
  }
});

// PUT    /:id            # Update review
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewId = Number(req.params.id);
    const { reviewerId, rating, comment } = req.body;

    const updatedReview = await db
      .update(reviews)
      .set({ rating, comment })
      .where(and(eq(reviews.reviewerId, reviewerId), eq(reviews.id, reviewId)))
      .returning();

    res.json(updatedReview);
  } catch (error) {
    next(error);
  }
});

// DELETE   /:id               # Delete review
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewId = Number(req.params.id);
      const { reviewerId } = req.body;

      const deletedReview = await db
        .delete(reviews)
        .where(
          and(eq(reviews.reviewerId, reviewerId), eq(reviews.id, reviewId))
        )
        .returning();

      res.json(deletedReview);
    } catch (error) {
      next(error);
    }
  }
);
