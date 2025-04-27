import { api } from "~/trpc/react";
import { useStateFilter } from "../StateButton";

export const useAll = () => {
	const { state } = useStateFilter();
	const all = api.inventory.get.all.useQuery({ state });

	return all;
};
