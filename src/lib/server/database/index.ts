import { createRequire } from "node:module";

// const require = createRequire(import.meta.url);
import { PrismaClient } from "@prisma/client";
import { PrismaClient as ComClient } from "@prisma/autosales";

export const prisma = new PrismaClient();
export const comClient = new ComClient();
