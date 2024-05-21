import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from "@mikro-orm/core";
import { User } from "./User.js";

@Entity()
export class Key {
	@Unique({ name: "key_id_key" })
	@PrimaryKey({ type: "string" })
	id!: string;

	@Property({ nullable: true, type: "string" })
	hashedPassword?: string;

	@ManyToOne({
		entity: () => User,
		updateRule: "cascade",
		deleteRule: "cascade",
		index: "key_user_id_idx",
	})
	user!: User;
}
