import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from "@mikro-orm/core";
import { User } from "./User.js";

@Entity()
export class Session {
	@Unique({ name: "session_id_key" })
	@PrimaryKey({ type: "string" })
	id!: string;

	@ManyToOne({
		entity: () => User,
		updateRule: "cascade",
		deleteRule: "cascade",
		index: "session_user_id_idx",
	})
	user!: User;

	@Property({ type: "string" })
	activeExpires!: bigint;

	@Property({ type: "string" })
	idleExpires!: bigint;

	@Property({ nullable: true, type: "string" })
	iv?: string;
}
