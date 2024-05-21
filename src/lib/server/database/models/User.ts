import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";

@Entity()
export class User {
	@Unique({ name: "user_id_key" })
	@PrimaryKey({ type: "string" })
	id!: string;

	@Unique({ name: "user_username_key" })
	@Property({ type: "string" })
	username!: string;

	@Unique({ name: "user_email_key" })
	@Property({ type: "string" })
	email!: string;
}
