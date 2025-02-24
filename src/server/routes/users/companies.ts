import express, { Request, Response, NextFunction } from "express";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { companies } from "../../db/schema";
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

router.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        userId,
        companyName,
        registrationNumber,
        description,
        websiteUrl,
      } = req.body;

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

      // Create the company
      const [newCompany] = await db
        .insert(companies)
        .values({
          userId,
          companyName,
          registrationNumber,
          description,
          websiteUrl,
        })
        .returning();

      res.status(201).json(newCompany);
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = Number(req.params.id);

    const { companyName, registrationNumber, description, websiteUrl } =
      req.body;

    const [updatedCompany] = await db
      .update(companies)
      .set({
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
