import { createMiddleware } from "@solidjs/start/middleware";
import { authedMiddleware } from "~/middlewares/authed.middleware";

export default createMiddleware({
  onRequest: [authedMiddleware],
});
