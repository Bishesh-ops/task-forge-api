import { jwt } from "hono/jwt";
import { env } from "../config/env";

export const authMiddleware = jwt({
  secret: env.API_KEY,
  alg: "HS256",
});
