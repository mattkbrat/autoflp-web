import { Entity, ManyToOne, PrimaryKey } from "@mikro-orm/core";
import { Charge } from "./Charge.js";
import { Creditor } from "./Creditor.js";

@Entity()
export class DefaultCharge {
	@PrimaryKey({ type: "string" })
	id!: string;

	@ManyToOne({
		entity: () => Creditor,
		fieldName: "creditor",
		updateRule: "cascade",
		deleteRule: "cascade",
	})
	creditor!: Creditor;

	@ManyToOne({
		entity: () => Charge,
		fieldName: "charge",
		updateRule: "cascade",
		deleteRule: "cascade",
	})
	charge!: Charge;
}
