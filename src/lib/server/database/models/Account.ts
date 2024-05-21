import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Person } from "./Person.js";

@Entity()
export class Account {
	@PrimaryKey({ type: "string" })
	id!: string;

	@ManyToOne({
		entity: () => Person,
		fieldName: "contact",
		updateRule: "cascade",
		deleteRule: "cascade",
	})
	contact!: Person;

	@Property({ nullable: true, type: "string" })
	cosigner?: string;

	@Property({ nullable: true, type: "string" })
	dateOfBirth?: string;

	@Property({ type: "string" })
	licenseNumber!: string;

	@Property({ nullable: true, type: "string" })
	licenseExpiration?: string;

	@Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP`, type: "string" })
	dateAdded?: string;

	@Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP`, type: "string" })
	dateModified?: string;

	@Property({ nullable: true, type: "string" })
	currentStanding?: string;

	@Property({ nullable: true, type: "string" })
	notes?: string;
}
