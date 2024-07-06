import type { Inventory } from "@prisma/client";
import { writable } from "svelte/store";

export const allInventory = writable([] as Inventory[]);
