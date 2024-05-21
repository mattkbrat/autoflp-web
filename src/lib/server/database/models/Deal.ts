import {
	Entity,
	ManyToOne,
	type Opt,
	PrimaryKey,
	Property,
} from "@mikro-orm/core";
import { Account } from "./Account.js";
import { Creditor } from "./Creditor.js";
import { Inventory } from "./Inventory.js";

@Entity()
export class Deal {
	@PrimaryKey({ type: "string" })
	id!: string;

	@Property({ type: "number" })
	state: number & Opt = 1;

	@Property({ type: "string" })
	date!: string;

	@ManyToOne({
		entity: () => Account,
		fieldName: "account",
		updateRule: "cascade",
		deleteRule: "cascade",
	})
	account!: Account;

	@ManyToOne({
		entity: () => Inventory,
		fieldName: "inventory",
		updateRule: "cascade",
		deleteRule: "cascade",
	})
	inventory!: Inventory;

	@ManyToOne({
		entity: () => Creditor,
		fieldName: "creditor",
		updateRule: "set null",
		deleteRule: "cascade",
		nullable: true,
	})
	creditor?: Creditor;

	@Property({ type: "string" })
	cash!: string;

	@Property({ nullable: true, defaultRaw: `0`, type: "string" })
	down?: string;

	@Property({ type: "string" })
	apr!: string;

	@Property({ nullable: true, type: "string" })
	finance?: string;

	@Property({ nullable: true, type: "string" })
	lien?: string;

	@Property({ nullable: true, type: "string" })
	pmt?: string;

	@Property({ type: "string" })
	term!: string;

	@Property({ nullable: true, type: "string" })
	taxCity?: string;

	@Property({ nullable: true, type: "string" })
	taxState?: string;

	@Property({ nullable: true, type: "string" })
	taxCounty?: string;

	@Property({ nullable: true, type: "string" })
	taxRtd?: string;
}
