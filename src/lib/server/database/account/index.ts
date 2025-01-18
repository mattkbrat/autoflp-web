import type { Prisma } from "@prisma/client";
export * from "./accounts";
export * from "./creditors";
export * from "./salesmen";
export * from "./person";

export const orderContactsBy: Prisma.CreditorOrderByWithRelationInput[] = [
	{
		contact: {
			lastName: "asc",
		},
	},
	{
		contact: {
			firstName: "asc",
		},
	},
];

export const contactSelect = {
	select: {
		id: true,
		lastName: true,
		firstName: true,
		middleInitial: true,
		phonePrimary: true,
	},
};
