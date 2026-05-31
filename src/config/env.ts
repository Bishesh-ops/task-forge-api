import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),
  DATABASE_URL: z.url().or(z.string().startsWith("file:")),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.flattenError(parsedEnv.error).fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;
