import express, { Request, Response, NextFunction } from "express";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { companies, users } from "../../db/schema";
import { checkUserExists } from "../../utils/userExists";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const companiesList = await db.query.companies.findMany({
      limit,
      offset,
    });
    res.json(companiesList);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = Number(req.params.id);

    const company = await db.query.companies.findFirst({
      where: eq(companies.id, companyId),
    });

    if (!company) {
      res.status(404).json({ error: "Company not found." });
      return;
    }

    res.json(company);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, companyName, registrationNumber, description, websiteUrl } =
      req.body;

    if (!userId || !companyName) {
      res
        .status(400)
        .json({ error: "Required params: userId and companyName." });
      return;
    }

    if (!(await checkUserExists(userId))) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    // Start a transaction to ensure both operations succeed or fail together
    const result = await db.transaction(async (tx) => {
      // Create the company
      const [newCompany] = await tx
        .insert(companies)
        .values({
          userId,
          companyName,
          registrationNumber,
          description,
          websiteUrl,
        })
        .returning();

      // Update the user's role
      const [updatedUser] = await tx
        .update(users)
        .set({
          role: "company",
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      return { company: newCompany, user: updatedUser };
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = Number(req.params.id);

    const { userId, companyName, registrationNumber, description, websiteUrl } =
      req.body;

    const [updatedCompany] = await db
      .update(companies)
      .set({
        userId,
        companyName,
        // TODO: Come back to change this in DB and here to:
        // 1. Employer Id Num (Ein)
        // 2. Company Reg Number
        // 3. State Reg number
        // https://blog.noticeninja.com/blog/business-reg-no
        registrationNumber,
        description,
        websiteUrl,
      })
      .where(eq(companies.id, companyId))
      .returning();

    if (!updatedCompany) {
      res.status(404).json({ error: "Company not found." });
      return;
    }

    res.json(updatedCompany);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:id/verify",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = Number(req.params.id);

      const [verifiedCompany] = await db
        .update(companies)
        .set({ verifiedAt: new Date() })
        .where(eq(companies.id, companyId))
        .returning();

      if (!verifiedCompany) {
        res.status(404).json({ error: "Company not found." });
        return;
      }

      res.json(verifiedCompany);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
