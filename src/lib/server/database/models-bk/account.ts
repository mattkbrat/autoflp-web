import { randomUUID } from "crypto";
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Account {
	@PrimaryKey({ type: "text" })
	id: string = randomUUID();

	@Property({ type: "text" })
	contact!: string | null;
	@Property({ type: "text" })
	consigner!: string | null;
	@Property({ type: "text" })
	date_of_birth!: string | null;
	@Property({ type: "text" })
	license_number!: string;
	@Property({ type: "text" })
	license_expiration!: string | null;
	@Property({ type: "text" })
	date_added!: string | null;
	@Property({ type: "text" })
	current_standing!: string | null;
	@Property({ type: "text" })
	notes!: string | null;
}
