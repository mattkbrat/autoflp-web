import { createTRPCRouter, protectedProcedure } from "../trpc";

export const businessRouter = createTRPCRouter({
	info: protectedProcedure.query(async ({ input }) => {
		// @TODO: Read client env for business information
		return {
			name: "AutoFLP",
			motto: "Auto Dealer Management for Family Owned Businesses",
			phone: "555-123-4567",
			address: "8420 Albany St. Oviedo, FL 32765",
		};
	}),
});
