import { RequestMiddleware } from "@solidjs/start/dist/middleware";
import { getCookie } from "vinxi/http";
import { db } from "~/db";
import { sessions } from "~/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "@solidjs/router";

export const authedMiddleware: RequestMiddleware = async (event) => {
  if (
    event.request.url.includes("/admin") &&
    !event.request.url.includes("/admin/login")
  ) {
    const sessionId = getCookie("__sessionId");
    if (!sessionId) {
      return redirect("/admin/login");
    }

    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .execute();

    if (!session || session.expiresAt < Date.now()) {
      return redirect("/admin/login");
    }
  }
};
