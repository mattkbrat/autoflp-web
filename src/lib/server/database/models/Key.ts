import {
	Entity,
	ManyToOne,
	PrimaryKey,
	Property,
	Unique,
} from "@mikro-orm/core";

@Entity()
@Unique({ name: "key_key_business_uindex", properties: ["key", "business"] })
export class Key {
	@Unique({ name: "key_id_uindex" })
	@PrimaryKey({ nullable: true, type: "string" })
	id?: string;

	@Property({ type: "string" })
	key!: string;

	@Property({ type: "string" })
	value!: string;

	@Property({ type: "string" })
	business!: string;
}
