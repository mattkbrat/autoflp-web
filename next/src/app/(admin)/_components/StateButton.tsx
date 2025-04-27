import { Button } from "@headlessui/react";
import { useQueryState } from "nuqs";
import { parseAsState } from "~/client/nuqs/parser";

export const useStateFilter = (key = "inv-state") => {
	const [state, setState] = useQueryState(key, parseAsState);

	return { state, setState };
};
export const StateButton = ({
	queryKey,
}: {
	queryKey?: string;
}) => {
	const { state, setState } = useStateFilter(queryKey);
	return (
		<Button
			type="button"
			className={"button"}
			onClick={() => {
				setState((curr) => (curr == null ? 1 : curr === 1 ? 0 : null));
			}}
		>
			{state == null ? "All" : state === 1 ? "Active" : "Inactive"}
		</Button>
	);
};
