import { Context } from "hono";
import { AuthService } from "../services/auth.service";
import { authSchema } from "../schemas/auth.schema";

export const AuthController = {
  async register(c: Context) {
    const rawBody = await c.req.json();
    const validData = authSchema.parse(rawBody);
    const result = await AuthService.register(validData);
    return c.json({ message: "Registration successful", ...result }, 201);
  },

  async login(c: Context) {
    const rawBody = await c.req.json();
    const validData = authSchema.parse(rawBody);
    const result = await AuthService.login(validData);
    return c.json({ message: "Login successful", ...result }, 200);
  },
};
