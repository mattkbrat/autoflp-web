import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Charge {
	@PrimaryKey({ type: "string" })
	id!: string;

	@Property({ type: "string" })
	name!: string;

	@Property({ type: "string" })
	amount!: string;

	@Property({ type: "string" })
	dateEffective!: string;
}
