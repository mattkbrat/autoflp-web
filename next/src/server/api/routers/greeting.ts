import { z } from "zod";

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "~/server/api/trpc";

const names: Set<string> = new Set();

export const greetingRouter = createTRPCRouter({
	hello: publicProcedure
		.input(z.object({ text: z.string() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.text}`,
			};
		}),

	create: protectedProcedure
		.input(z.object({ name: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			names.add(input.name);
			return `Hello, ${input.name}`;
		}),

	getLatest: protectedProcedure.query(async ({ ctx }) => {
		const arr = Array.from(names);
		return arr[arr.length - 1] ?? null;
	}),

	getGuests: protectedProcedure.query(() => names),
	getSecretMessage: protectedProcedure.query(() => {
		return "you can now see this secret message!";
	}),
});
