import { eq } from "drizzle-orm";
import { db } from "../db";
import { workerProfiles } from "../db/schema";

export async function checkWorkerExists(userId: number) {
  const user = await db.query.workerProfiles.findFirst({
    where: eq(workerProfiles.userId, userId),
    columns: { userId: true },
  });

  return !!user;
}
