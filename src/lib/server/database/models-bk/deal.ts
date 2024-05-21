import { randomUUID } from "crypto";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Deal {
	@PrimaryKey({ type: "text" })
	id: string = randomUUID();

	@Property({ type: "int" })
	state = 1;

	@Property({ type: "text" })
	date!: string;

	@Property({ type: "text" })
	account!: string;

	@Property({ type: "text" })
	inventory!: string;

	@Property({ type: "text" })
	creditor!: string | null;

	@Property({ type: "text" })
	cash!: string;

	@Property({ type: "text" })
	down = 0;

	@Property({ type: "text" })
	apr!: string;

	@Property({ type: "text" })
	finance!: string;
	@Property({ type: "text" })
	lien!: string;
	@Property({ type: "text" })
	pmt!: string;
	@Property({ type: "text" })
	term!: string;
	@Property({ type: "text" })
	tax_city!: string;
	@Property({ type: "text" })
	tax_state!: string;
	@Property({ type: "text" })
	tax_county!: string;
	@Property({ type: "text" })
	tax_rtd!: string;
}
