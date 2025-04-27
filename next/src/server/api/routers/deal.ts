import { z } from "zod";
import { getAccountDeals } from "~/server/db/queries/deal/get";
import { getDetailedDeal } from "~/server/db/queries/deal/get-detailed";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const dealRouter = createTRPCRouter({
	get: {
		byAcocunt: protectedProcedure
			.input(z.string().nullable())
			.query(({ input }) => (input ? getAccountDeals(input) : null)),
		detailed: protectedProcedure
			.input(z.string().nullable())
			.query(({ input }) => {
				return input ? getDetailedDeal(input) : null;
			}),
	},
});
