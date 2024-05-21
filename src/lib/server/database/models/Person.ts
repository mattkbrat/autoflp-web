import { Entity, type Opt, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Person {
	@PrimaryKey({ type: "string" })
	id!: string;

	@Property({ nullable: true, type: "string" })
	namePrefix?: string;

	@Property({ type: "string" })
	firstName!: string;

	@Property({ nullable: true, type: "string" })
	middleInitial?: string;

	@Property({ type: "string" })
	lastName!: string;

	@Property({ nullable: true, type: "string" })
	nameSuffix?: string;

	@Property({ fieldName: "address_1", type: "string" })
	address1!: string;

	@Property({ fieldName: "address_2", nullable: true, type: "string" })
	address2?: string;

	@Property({ fieldName: "address_3", nullable: true, type: "string" })
	address3?: string;

	@Property({ type: "string" })
	city: string & Opt = "Fort Morgan";

	@Property({ type: "string" })
	stateProvince: string & Opt = "CO";

	@Property({ type: "string", defaultRaw: `80701` })
	zipPostal!: string & Opt;

	@Property({ fieldName: "zip_4", nullable: true, type: "string" })
	zip4?: string;

	@Property({ type: "string" })
	country: string & Opt = "US";

	@Property({ type: "string" })
	phonePrimary!: string;

	@Property({ nullable: true, type: "string" })
	phoneSecondary?: string;

	@Property({ nullable: true, type: "string" })
	phoneTertiary?: string;

	@Property({ nullable: true, type: "string" })
	emailPrimary?: string;

	@Property({ nullable: true, type: "string" })
	emailSecondary?: string;
}
