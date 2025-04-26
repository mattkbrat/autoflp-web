import { useQueryState } from "nuqs";
import { parseAsState } from "~/client/nuqs/parser";
import { api } from "~/trpc/react";

export const useInvState = () => {
	const [state, setState] = useQueryState(
		"inv-state",
		parseAsState.withDefault(1),
	);

	return { state, setState };
};

export const useAll = () => {
	const { state } = useInvState();
	const all = api.inventory.get.all.useQuery({ state });

	return all;
};
