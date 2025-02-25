import { db } from "../db";
import { workSites } from "../db/schema";
import { eq } from "drizzle-orm";

export default async function checkSiteExists(siteId: number) {
  const site = await db.query.workSites.findFirst({
    where: eq(workSites.id, siteId),
  });

  return !!site;
}
