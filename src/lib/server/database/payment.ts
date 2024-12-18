import type { Payment } from "@prisma/client";
import { prisma } from ".";
import { sendPaymentNotification } from "../notify";

export const getPaymentsByDeal = async (deal: string) => {
	return prisma.payment.findMany({ where: { dealId: deal } });
};

const notify = async (dealId: string, amount: string) => {
	return sendPaymentNotification({
		dealId,
		type: "create",
		amount: amount,
	});
};

export const recordPayment = async (payment: Payment) => {
	const exists = await prisma.payment.findFirst({
		where: {
			dealId: payment.dealId,
			date: payment.date,
		},
	});

	return (
		exists
			? prisma.payment.update({
					where: {
						id: exists.id,
					},
					data: {
						amount: (Number(exists.amount) + Number(payment.amount)).toString(),
					},
				})
			: prisma.payment.create({ data: payment })
	).then((p) => {
		notify(p.dealId, payment.amount);

		return p;
	});
};

export const deletePayment = async (payment: string | string[]) => {
	if (!payment) {
		throw new Error("Must provide a payment ID");
	}

	const paymentArr = Array.isArray(payment) ? payment : [payment];
	const payments = await prisma.payment.findMany({
		where: { id: { in: paymentArr } },
	});

	return prisma.payment
		.deleteMany({ where: { id: { in: paymentArr } } })
		.then(async () => {
			for await (const p of payments) {
				sendPaymentNotification({
					dealId: p.dealId,
					type: "delete",
					amount: p.amount,
				});
			}
			return payments;
		});
};
