import { Hono } from "hono";
import { logger } from "hono/logger";
import { TaskController } from "./controllers/task.controller";
import { AuthController } from "./controllers/auth.controller";
import { authMiddleware } from "./middlewares/auth.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import { env } from "./config/env";
import { cors } from "hono/cors";

type Variables = {
  jwtPayload: {
    sub: string; // The User ID
    email: string;
    exp: number;
  };
};

const app = new Hono<{ Variables: Variables }>();

app.onError(errorHandler);
app.use("*", logger());
app.get("/", (c) => c.json({ status: "Task Forge API is live." }));
app.use(
  "*",
  cors({
    origin: "http://localhost:5713",
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Auth Routes
app.post("/auth/register", AuthController.register);
app.post("/auth/login", AuthController.login);

// Task Routes
app.post("/tasks", authMiddleware, TaskController.create);
app.get("/tasks", authMiddleware, TaskController.getAll);
app.get("/tasks/:id", authMiddleware, TaskController.getById);
app.patch("/tasks/:id", authMiddleware, TaskController.update);
app.delete("/tasks/:id", authMiddleware, TaskController.delete);

export { app };
export default {
  port: env.PORT,
  fetch: app.fetch,
};
