import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Charge } from "./Charge.js";
import { Deal } from "./Deal.js";

@Entity()
export class DealCharge {
	@ManyToOne({
		entity: () => Deal,
		fieldName: "deal",
		updateRule: "cascade",
		deleteRule: "cascade",
		nullable: true,
	})
	deal?: Deal;

	@ManyToOne({
		entity: () => Charge,
		fieldName: "charge",
		updateRule: "cascade",
		deleteRule: "cascade",
		nullable: true,
	})
	charge?: Charge;

	@Property({ nullable: true, type: "string" })
	date?: string;

	@Property({ nullable: true, type: "string" })
	note?: string;

	@PrimaryKey({ type: "string" })
	id!: string;
}
