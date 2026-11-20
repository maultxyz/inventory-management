import { createMiddleware } from "hono/factory";
import { verifyNeonAuthToken } from "../auth/neon";

export type AppVariables = {
  userId: string;
};
export type AppEnv = { Variables: AppVariables };

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
  const payload = await verifyNeonAuthToken(authHeader.slice(7));
  if (!payload) {
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
  c.set("userId", payload.sub);
  await next();
});
