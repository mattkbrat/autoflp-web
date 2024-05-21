import { Entity, ManyToOne, PrimaryKey } from "@mikro-orm/core";
import { Person } from "./Person.js";

@Entity()
export class Salesman {
	@PrimaryKey({ type: "string" })
	id!: string;

	@ManyToOne({ entity: () => Person, fieldName: "person" })
	person!: Person;
}
