import type { AllInventory } from "$lib/server/database/inventory";
import { writable } from "svelte/store";

export const allInventory = writable([] as AllInventory);
