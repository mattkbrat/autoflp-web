import { defineConfig } from "@mikro-orm/better-sqlite";
import { EntityGenerator } from "@mikro-orm/entity-generator";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DATABASE_URL;

console.log(dbName);

export default defineConfig({
	dbName,
	extensions: [EntityGenerator],
});
