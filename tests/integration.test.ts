import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { app } from "../src/index";
import { prisma } from "../src/db/client";
import { execSync } from "child_process";

let authToken = "";
let testTaskId = "";

describe("Task Forge API Integration Suite", () => {
  beforeAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("Should reject registration with invalid data (Sad Path)", async () => {
    const res = await app.request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", password: "123" }),
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.error).toBe("Validation failed");
  });

  it("Should successfully register a new user (Happy Path)", async () => {
    const res = await app.request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@forge.com",
        password: "supersecure123",
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.message).toBe("Registration successful");
    expect(data.token).toBeDefined();

    authToken = data.token;
  });

  it("Should block task creation without a token (Sad Path)", async () => {
    const res = await app.request("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Unauthorized Task", priority: 1 }),
    });

    expect(res.status).toBe(401);
  });

  it("Should create a task for the authenticated user (Happy Path)", async () => {
    const res = await app.request("/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ title: "Integration Test Task", priority: 5 }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.task.title).toBe("Integration Test Task");

    testTaskId = data.task.id;
  });

  it("Should update the task status to DONE", async () => {
    const res = await app.request(`/tasks/${testTaskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status: "DONE" }),
    });

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.task.status).toBe("DONE");
  });

  it("Should return 404 for a non-existent task", async () => {
    const res = await app.request("/tasks/fake-uuid-123", {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(res.status).toBe(404);
  });
});
