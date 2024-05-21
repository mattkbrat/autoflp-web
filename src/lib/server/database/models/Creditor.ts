import {
	Entity,
	ManyToOne,
	type Opt,
	PrimaryKey,
	Property,
	Unique,
} from "@mikro-orm/core";
import { Person } from "./Person.js";

@Entity()
@Unique({
	name: "unique_business_contact",
	properties: ["businessName", "contact"],
})
export class Creditor {
	@PrimaryKey({ type: "string" })
	id!: string;

	@Property({ type: "string" })
	businessName!: string;

	@ManyToOne({
		entity: () => Person,
		fieldName: "contact",
		updateRule: "cascade",
		deleteRule: "cascade",
	})
	contact!: Person;

	@Property({ type: "string" })
	filingFees!: string;

	@Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP`, type: "string" })
	dateAdded?: string;

	@Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP`, type: "string" })
	dateModified?: string;

	@Property({ type: "string", defaultRaw: `"10"` })
	apr!: string & Opt;
}
