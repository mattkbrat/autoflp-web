import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Deal } from "./Deal.js";
import { Inventory } from "./Inventory.js";

@Entity()
export class DealTrade {
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
		entity: () => Inventory,
		fieldName: "vin",
		updateRule: "cascade",
		deleteRule: "cascade",
	})
	vin!: Inventory;

	@Property({ type: "string" })
	value!: string;
}
