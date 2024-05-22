import { orm } from ".";
import { Payment } from "./models/Payment";

export const getPaymentsByDeal = async (deal: string) => {
	return orm.em.findAll(Payment, {
		where: {
			deal,
		},
	});
};

export const recordPayment = async (payment: Payment) => {
	return orm.em.insert(Payment, payment);
};

export const deletePayment = async (payment: string) => {
	const pmt = orm.em.getReference(Payment, payment);
	await orm.em.remove(pmt).flush();
};
