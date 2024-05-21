import { Entity, type Opt, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Inventory {
	@PrimaryKey({ type: "string" })
	id!: string;

	@Property({ type: "string" })
	vin!: string;

	@Property({ type: "string" })
	year!: string;

	@Property({ type: "string" })
	make!: string;

	@Property({ nullable: true, type: "string" })
	model?: string;

	@Property({ nullable: true, type: "string" })
	body?: string;

	@Property({ nullable: true, type: "string" })
	color?: string;

	@Property({ nullable: true, type: "string" })
	fuel?: string;

	@Property({ nullable: true, type: "string" })
	cwt?: string;

	@Property({ nullable: true, type: "string" })
	mileage?: string;

	@Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP`, type: "string" })
	dateAdded?: string;

	@Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP`, type: "string" })
	dateModified?: string;

	@Property({ nullable: true, type: "string" })
	picture?: string;

	@Property({ nullable: true, type: "string" })
	cash?: string;

	@Property({ nullable: true, type: "string" })
	credit?: string;

	@Property({ nullable: true, type: "string" })
	down?: string;

	@Property({ type: "number" })
	state: number & Opt = 1;
}
