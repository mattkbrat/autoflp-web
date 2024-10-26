import { createRequire } from "node:module";
//
const require = createRequire(import.meta.url);
import { PrismaClient } from "@prisma/client";
import { PrismaClient as ComClient } from "@prisma/autosales";
import { dev } from "$app/environment";

const getClient = () => {
	return new PrismaClient();
};

const getComClient = () => {
	return new ComClient();
};

const { PrismaClient: RequireClient } = require("@prisma/client");
const { PrismaClient: RequireComClient } = require("@prisma/autosales");

export const prisma: ReturnType<typeof getClient> = new (
	dev ? PrismaClient : RequireClient
)();
export const comClient: ReturnType<typeof getComClient> = new (
	dev ? RequireComClient : ComClient
)();

// const { PrismaClient: RequireClient } = require("@prisma/client");
// const { PrismaClient: RequireComClient } = require("@prisma/autosales");
//
// export const prisma = new RequireClient();
// export const comClient = RequireComClient;
