import {
	Entity,
	type Opt,
	PrimaryKey,
	PrimaryKeyProp,
	Property,
} from "@mikro-orm/core";

@Entity({ tableName: "__diesel_schema_migrations" })
export class DieselSchemaMigrations {
	[PrimaryKeyProp]?: "version";

	@PrimaryKey({ type: "string" })
	version!: string;

	@Property({ type: "Date", defaultRaw: `CURRENT_TIMESTAMP` })
	runOn!: Date & Opt;
}
