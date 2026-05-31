import { Context } from "hono";
import { TaskService } from "../services/task.service";
import { taskSchema, updateTaskSchema } from "../schemas/task.schema";

export const TaskController = {
  async create(c: Context) {
    const payload = c.get("jwtPayload") as any;
    const rawBody = await c.req.json();

    const validTask = taskSchema.parse(rawBody);
    const createdTask = await TaskService.createTask(payload.sub, validTask);

    return c.json({ message: "Task created.", task: createdTask }, 201);
  },

  async getAll(c: Context) {
    const payload = c.get("jwtPayload") as any;
    const status = c.req.query("status");
    const limitParam = c.req.query("limit");
    const limit = limitParam ? parseInt(limitParam) : undefined;

    const allTasks = await TaskService.getAllTasks(payload.sub, {
      status,
      limit,
    });

    return c.json({ tasks: allTasks });
  },

  async getById(c: Context) {
    const payload = c.get("jwtPayload") as any;
    const id = c.req.param("id") as any;

    const task = await TaskService.getTaskById(payload.sub, id);

    if (!task) return c.json({ error: "Task not found" }, 404);

    return c.json({ task });
  },

  async update(c: Context) {
    const payload = c.get("jwtPayload") as any;
    const id = c.req.param("id") as any;
    const rawBody = await c.req.json();

    const validUpdate = updateTaskSchema.parse(rawBody);

    const updatedTask = await TaskService.updateTask(
      payload.sub,
      id,
      validUpdate,
    );

    return c.json({ message: "Task updated", task: updatedTask });
  },

  async delete(c: Context) {
    const payload = c.get("jwtPayload") as any;
    const id = c.req.param("id") as any;

    await TaskService.deleteTask(payload.sub, id);

    return c.json({ message: "Task deleted successfully" }, 200);
  },
};
