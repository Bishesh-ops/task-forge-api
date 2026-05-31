import { z } from "zod";
console.log(process.env.API_KEY);

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  API_KEY: z.string().min(10, "API_KEY must be at least 10 characters long"),
  DATABASE_URL: z.url().or(z.string().startsWith("file:")),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.flattenError(parsedEnv.error).fieldErrors);
  process.exit(1);
}
export const env = parsedEnv.data;
