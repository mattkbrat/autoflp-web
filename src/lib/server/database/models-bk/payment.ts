import { randomUUID } from "crypto";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Payment {
	@PrimaryKey({ type: "text" })
	id: string = randomUUID();

	@Property({ type: "text" })
	deal!: string;

	@Property({ type: "text" })
	date!: string;

	@Property({ type: "text" })
	amount!: string;
}
