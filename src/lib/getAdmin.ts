import { eq, InferSelectModel } from "drizzle-orm";
import { admins, sessions } from "~/db/schema";
import { db } from "~/db";

export async function getAdmin(
  sessionId: string,
): Promise<InferSelectModel<typeof admins> | undefined> {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .execute();
  if (!session) return;

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.id, session.adminId))
    .execute();

  return admin;
}
