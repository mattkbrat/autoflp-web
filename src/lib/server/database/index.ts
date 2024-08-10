import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const { PrismaClient: ComClient } = require("@prisma/autosales");

export const prisma = new PrismaClient();
export const comClient = new ComClient();
