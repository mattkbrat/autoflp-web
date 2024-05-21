import { orm } from ".";
import { Payment, type Payment as PaymentType } from "./models/payment";

export const getPaymentsByDeal = async (deal: string) => {
	return orm.em.findAll(Payment, {
		where: {
			deal,
		},
	});
};
