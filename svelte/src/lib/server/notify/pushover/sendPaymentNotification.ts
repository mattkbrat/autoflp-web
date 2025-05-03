import {
	formatCurrency,
	formatInventory,
	fullNameFromPerson,
} from "$lib/format";
import { prisma } from "$lib/server/database";
import { siteUrl } from "$lib/server/env";
import type { PushoverNotification } from "./constants";
import { sendNotification } from "./sendNotification";

export const sendPaymentNotification = async ({
	type,
	dealId: id,
	amount,
	notification,
}: {
	type: "delete" | "create";
	dealId: string;
	amount: number | string;
	notification?: Omit<PushoverNotification, "title" | "message">;
}) => {
	const accountInfo = await prisma.deal.findUnique({
		where: { id },
		select: {
			lien: true,
			term: true,
			id: true,
			inventory: {
				select: {
					make: true,
					model: true,
				},
			},
			account: {
				select: {
					id: true,
					contact: {
						select: {
							lastName: true,
						},
					},
				},
			},
		},
	});
	if (!accountInfo) {
		console.warn(
			"Failed to get account info, cannot send notification",
			id,
			type,
			notification,
		);
		return;
	}
	const title = type === "delete" ? "Payment Deleted" : "New Payment Recorded";

	const fullName = fullNameFromPerson({
		person: accountInfo.account.contact,
	});

	const invString = formatInventory(accountInfo.inventory);

	const message = `${formatCurrency(amount)} ${
		type === "delete" ? "Debited from" : "Credited towards"
	} ${fullName} - ${invString}`.trim();

	const url = `${siteUrl}/payments/${accountInfo.account.id}/${accountInfo.id}`;

	const fullNotification: PushoverNotification = Object.assign(
		notification || {},
		{
			title,
			message,
			url,
		},
	);

	return sendNotification(fullNotification);
};
