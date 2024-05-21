import { orm } from ".";
import { Payment } from "./models/Payment";

export const getPaymentsByDeal = async (deal: string) => {
	return orm.em.findAll(Payment, {
		where: {
			deal,
		},
	});
};
