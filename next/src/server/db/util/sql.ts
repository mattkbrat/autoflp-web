import { type SQL, sql } from "drizzle-orm";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";

export function lower(col: AnySQLiteColumn): SQL {
  return sql<string>`lower(${col})`;
}

export function upper(col: AnySQLiteColumn): SQL {
  return sql<string>`upper(${col})`;
}

export function strftime(col: AnySQLiteColumn, fmt = "%Y-%m-%d"): SQL {
  return sql<string>`strftime(${fmt}, ${col})`;
}

export function int(col: AnySQLiteColumn): SQL<number> {
  return sql<number>`cast(${col} as int)`
}
