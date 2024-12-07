import type { Payment } from "@prisma/client";
import { prisma } from ".";
import { sendPaymentNotification } from "../notify";
import { formatCurrency } from "$lib/format";

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
	const exists = await prisma.payment.findUnique({
		where: {
			dealId_date_amount: {
				dealId: payment.dealId,
				date: payment.date,
				amount: payment.amount,
			},
		},
	});

	if (exists) {
		return prisma.payment
			.update({
				where: {
					id: exists.id,
				},
				data: {
					amount: formatCurrency(
						Number(exists.amount) + Number(payment.amount),
					),
				},
			})
			.then((p) => {
				notify(p.dealId, p.amount);
				return p;
			});
	}
	return prisma.payment.create({ data: payment }).then((p) => {
		notify(p.dealId, p.amount);

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
