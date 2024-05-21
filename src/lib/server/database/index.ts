import { DATABASE_URL } from "$env/static/private";
import { BetterSqliteDriver } from "@mikro-orm/better-sqlite";
import { MikroORM } from "@mikro-orm/core";
import { Payment } from "./models/payment";

export const orm = await MikroORM.init<BetterSqliteDriver>({
	driver: BetterSqliteDriver,
	dbName: DATABASE_URL,
	entities: [Payment],
	serialization: { forceObject: true },
});
