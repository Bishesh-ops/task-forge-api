import { describe, it, expect, beforeAll } from "bun:test";
import { app } from "../src/index";

let authToken = "";

describe("Task API Endpoints", () => {
  beforeAll(async () => {
    const res = await app.request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `test_${Date.now()}@forge.com`,
        password: "supersecure123",
      }),
    });
    const data = (await res.json()) as any;
    authToken = data.token;
  });

  it("Should reject a task with an invalid priority", async () => {
    const response = await app.request("/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ title: "Learn Unit Testing", priority: 10 }),
    });

    expect(response.status).toBe(400);
    const data = (await response.json()) as any;
    expect(data.error).toBe("Validation failed");
    expect(Array.isArray(data.details.priority)).toBe(true);
  });

  it("Should successfully create a valid task", async () => {
    const response = await app.request("/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ title: "Implement API Tests", priority: 1 }),
    });

    expect(response.status).toBe(201);
    const data = (await response.json()) as any;
    expect(data.message).toBe("Task created.");
    expect(data.task.title).toBe("Implement API Tests");
    expect(data.task.id).toBeDefined();
  });

  it("Should fetch all tasks", async () => {
    const response = await app.request("/tasks", {
      method: "GET",
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.status).toBe(200);
    const data = (await response.json()) as any;
    expect(Array.isArray(data.tasks)).toBe(true);
    expect(data.tasks.length).toBeGreaterThan(0);
  });
});
