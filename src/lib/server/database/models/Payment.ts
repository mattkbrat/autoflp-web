import {
	Entity,
	ManyToOne,
	type Opt,
	PrimaryKey,
	Property,
} from "@mikro-orm/core";
import { Deal } from "./Deal.js";

@Entity()
export class Payment {
	@PrimaryKey({ type: "string" })
	id!: string;

	@ManyToOne({
		entity: () => Deal,
		fieldName: "deal",
		updateRule: "cascade",
		deleteRule: "cascade",
	})
	deal!: Deal;

	@Property({ type: "string", defaultRaw: `CURRENT_TIMESTAMP` })
	date!: string & Opt;

	@Property({ type: "string" })
	amount!: string;
}
