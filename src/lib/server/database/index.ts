import { DATABASE_URL, DATABASE_URL_MIKRO } from "$env/static/private";
import { BetterSqliteDriver } from "@mikro-orm/better-sqlite";
import { MikroORM } from "@mikro-orm/core";
import { Account } from "./models/Account";
import { Charge } from "./models/Charge";
import { Creditor } from "./models/Creditor";
import { Deal } from "./models/Deal";
import { DealCharge } from "./models/DealCharge";
import { DealSalesman } from "./models/DealSalesman";
import { DealTrade } from "./models/DealTrade";
import { DefaultCharge } from "./models/DefaultCharge";
import { Inventory } from "./models/Inventory";
import { Key } from "./models/Key";
import { LoginKey } from "./models/LoginKey";
import { Payment } from "./models/Payment";
import { Person } from "./models/Person";
import { Salesman } from "./models/Salesman";
import { User } from "./models/User";

export const orm = await MikroORM.init<BetterSqliteDriver>({
	driver: BetterSqliteDriver,
	dbName: DATABASE_URL_MIKRO,
	allowGlobalContext: true,
	entities: [
		Payment,
		Deal,
		Account,
		Charge,
		Creditor,
		DealCharge,
		DealSalesman,
		DealTrade,
		DefaultCharge,
		Inventory,
		Person,
		Salesman,
		User,
		Key,
		LoginKey,
	],
	serialization: { forceObject: true },
});

// src/lib/prisma.ts

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
export type Orm = typeof orm;
