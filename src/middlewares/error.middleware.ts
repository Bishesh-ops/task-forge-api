import { Context } from "hono";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";

export const errorHandler = (err: Error, c: Context) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  if (err instanceof z.ZodError) {
    return c.json(
      {
        error: "Validation failed",
        details: z.flattenError(err).fieldErrors,
      },
      400,
    );
  }

  if (err && typeof err === "object" && "code" in err) {
    switch (err.code) {
      case "P2025":
        return c.json({ error: "Record not found in the database." }, 404);
      case "P2002":
        return c.json({ error: "This record already exists." }, 409);
      default:
        console.error(`[Prisma Error] Code: ${err.code}`, err);
        return c.json({ error: "Database error occurred." }, 500);
    }
  }

  if (
    err.message === "Invalid credentials" ||
    err.message === "User already exists"
  ) {
    const status = err.message === "Invalid credentials" ? 401 : 400;
    return c.json({ error: err.message }, status);
  }

  console.error(`[Unhandled Exception]`, err);
  return c.json({ error: "Internal Server Error" }, 500);
};
