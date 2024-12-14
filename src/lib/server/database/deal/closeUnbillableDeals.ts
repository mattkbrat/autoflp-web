import { env } from "$env/dynamic/private";
import { sendDealNotification } from "$lib/server/notify";
import { prisma } from "..";
import type { BillingAccounts } from "./getDeals";

export const closeUnbillableDeals = async (deals: BillingAccounts) => {
	const toClose = deals.reduce(
		(acc, d) => {
			if (d.state === 0) return acc;
			let reason = "";
			const creditor = d.creditor?.businessName.toLowerCase();
			if (creditor !== env.BUSINESS_NAME.toLowerCase()) {
				reason = `different creditor (${creditor})`;
			} else {
				const lien = Number(d.lien);
				const isCashDeal = Number.isNaN(lien) || !lien;
				if (!isCashDeal) return acc;
				reason = "cash deal";
			}

			if (!reason) return acc;

			acc.push({ id: d.id, reason });
			return acc;
		},
		[] as { id: string; reason: string }[],
	);

	if (toClose.length === 0) return;
	await prisma.deal.updateMany({
		where: {
			id: {
				in: toClose.map((d) => d.id),
			},
		},
		data: {
			state: 0,
		},
	});

	await Promise.allSettled(
		toClose.map((deal) => {
			return sendDealNotification({
				type: "close",
				dealId: deal.id,
				notification: {
					title: "Closed unbillable account",
					message: deal.reason,
				},
			});
		}),
	);
};
