import { z } from "zod";
import { getAccountDeals } from "~/server/db/queries/deal/get";
import { getDetailedDeal } from "~/server/db/queries/deal/get-detailed";
import { createPayment } from "~/server/db/queries/payment/create";
import { deletePayment } from "~/server/db/queries/payment/delete";
import { getPayments } from "~/server/db/queries/payment/get";
import {
	paymentCreateSchema,
	paymentDeleteSchema,
	paymentSelectSchema,
	paymentWhereSchema,
} from "~/server/db/queries/payment/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const dealRouter = createTRPCRouter({
	get: {
		payments: protectedProcedure
			.input(paymentWhereSchema)
			.query(async ({ input }) => {
				getPayments(input);
			}),
		byAcocunt: protectedProcedure
			.input(z.string().nullable())
			.query(({ input }) => (input ? getAccountDeals(input) : null)),
		detailed: protectedProcedure
			.input(z.string().nullable())
			.query(({ input }) => {
				return input ? getDetailedDeal(input) : null;
			}),
	},
	create: {
		payment: protectedProcedure
			.input(paymentCreateSchema)
			.mutation(async ({ input }) => {
				createPayment(input);
			}),
	},
	delete: {
		payment: protectedProcedure
			.input(paymentDeleteSchema)
			.mutation(async ({ input }) => {
				return deletePayment(input);
			}),
	},
});
