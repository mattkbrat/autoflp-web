import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
	inventorySchema,
	upsertInventory,
} from "~/server/db/queries/inventory/create";
import {
	deleteInventory,
	deleteInventorySchema,
} from "~/server/db/queries/inventory/delete";
import {
	aggregateInventory,
	getAllInventory,
	getInventoryByVin,
	getSalesmen,
	inventoryFilter,
} from "~/server/db/queries/inventory/get";
import { handleFetch, parseNHTSA } from "~/server/inventory/nhtsa";

export const inventoryRouter = createTRPCRouter({
	get: {
		all: protectedProcedure
			.input(inventoryFilter.optional())
			.query(async ({ input }) => {
				return getAllInventory(input).then(aggregateInventory);
			}),
		salesmen: protectedProcedure.query(getSalesmen),
		byId: protectedProcedure
			.input(z.string().or(z.null()))
			.query(async ({ input }) => {
				if (!input) {
					console.error("Missing input", input);
					return null;
				}
				const inv = await getInventoryByVin(input);
				console.log("searched", inv, input);
				return inv;
			}),
	},
	search: protectedProcedure
		.input(z.string().or(z.null()))
		.query(async ({ input }) => {
			if (!input) return null;
			const searched = await handleFetch(input);
			const parsed = parseNHTSA(searched);
			return parsed;
		}),
	create: protectedProcedure
		.input(inventorySchema)
		.mutation(async ({ input }) => {
			return upsertInventory(input);
		}),
	delete: {
		byId: protectedProcedure
			.input(deleteInventorySchema)
			.mutation(async ({ input }) => {
				return deleteInventory(input);
			}),
	},
});
