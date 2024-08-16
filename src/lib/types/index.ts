import type { ComInventoryWithUrl } from "./com";
import type { LocalInventory } from "./local";

export type AsyncReturnType<T extends (...args: any) => Promise<unknown>> =
	T extends (...args: any) => Promise<infer R> ? R : unknown;

export type StringObj = { [key: string]: string };

export type * from "./com";
export type * from "./local";

export type { ArrayElement } from "./ArrayElement";

export type GroupedComInv = {
	com: ComInventoryWithUrl[number];
	local: LocalInventory;
}[];

type MissingCom = { type: "com"; id: number };
type MissingLocal = { type: "local"; id: string };

export type MissingVins = ((MissingCom | MissingLocal) & {
	description: string;
})[];
