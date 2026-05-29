import { PrismaClient } from "@prisma/client";
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite";

const adapter = new PrismaBunSqlite({ url: 'file:./dev.db' })
export const prisma = new PrismaClient({ adapter })