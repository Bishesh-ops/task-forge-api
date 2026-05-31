import { PrismaClient } from "@prisma/client";
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";
import { env } from "../config/env";

const adapter = new PrismaBunSqlite({ url: env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
