import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { newAccount, upsertAccount } from "~/server/db/queries/account/create";
import {
	deleteAccount,
	deleteAccountSchema,
} from "~/server/db/queries/account/delete";
import {
	getAccountWithPerson,
	getAllAccounts,
} from "~/server/db/queries/account/get";
import { state } from "~/utils/zod/state";

export const accountRouter = createTRPCRouter({
	get: {
		all: protectedProcedure
			.input(state.optional())
			.query(({ input }) => getAllAccounts(input)),
		byId: protectedProcedure
			.input(z.string().or(z.null()))
			.query(async ({ input: accountId }) => {
				if (!accountId) return null;
				return getAccountWithPerson(accountId);
			}),
	},
	create: protectedProcedure
		.input(newAccount)
		.mutation(async ({ ctx, input }) => {
			return upsertAccount(input);
		}),
	delete: {
		byId: protectedProcedure
			.input(deleteAccountSchema)
			.mutation(async ({ input }) => {
				return deleteAccount(input);
			}),
	},
});
