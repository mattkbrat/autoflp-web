import { Button } from "@headlessui/react";
import { useInvState } from "./hooks";

export const StateButton = () => {
	const { state, setState } = useInvState();
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
