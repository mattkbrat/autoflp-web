import { orm } from ".";
import { Deal } from "./models-bk/deal";

export const getDealIds = async () => {
	return orm.em.findAll(Deal, {
		fields: ["id"],
	});
};
