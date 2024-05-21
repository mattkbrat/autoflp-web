import { Entity, ManyToOne, PrimaryKey } from "@mikro-orm/core";
import { Deal } from "./Deal.js";
import { Salesman } from "./Salesman.js";

@Entity()
export class DealSalesman {
	@PrimaryKey({ type: "string" })
	id!: string;

	@ManyToOne({
		entity: () => Deal,
		fieldName: "deal",
		updateRule: "cascade",
		deleteRule: "cascade",
	})
	deal!: Deal;

	@ManyToOne({
		entity: () => Salesman,
		fieldName: "salesman",
		updateRule: "cascade",
		deleteRule: "cascade",
	})
	salesman!: Salesman;
}
