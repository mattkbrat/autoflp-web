import {
	formatCurrency,
	formatInventory,
	fullNameFromPerson,
} from "$lib/format";
import { prisma } from "$lib/server/database";
import { siteUrl } from "$lib/server/env";
import type { PushoverNotification } from "./constants";
import { sendNotification } from "./sendNotification";

export const sendDealNotification = async ({
	type,
	dealId: id,
	notification,
}: {
	type: "update" | "close" | "create";
	dealId: string;
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
	const title =
		type === "close"
			? "Deal Closed"
			: type === "update"
				? "Deal Updated"
				: "New Deal Recorded";

	const fullName = fullNameFromPerson({
		person: accountInfo.account.contact,
	});

	const invString = formatInventory(accountInfo.inventory);

	const messageSuffix = ` - term: ${accountInfo.term}; lien - ${formatCurrency(
		accountInfo.lien,
	)}`;

	const message = `${fullName} - ${invString} ${messageSuffix}`.trim();

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
