import { DATABASE_URL } from "$env/static/private";
import Database from "better-sqlite3";

export const db = () => {
	console.log(DATABASE_URL);
	const db = new Database(DATABASE_URL, {
		readonly: false,
	});

	return db;
};
