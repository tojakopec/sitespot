import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export async function checkUserExists(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true },
  });

  return !!user;
}
