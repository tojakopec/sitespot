import { eq } from "drizzle-orm";
import { db } from "../db";
import { companies } from "../db/schema";

export async function checkCompanyExists(companyId: number) {
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
  });

  return !!company;
}
