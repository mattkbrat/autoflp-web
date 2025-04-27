import clsx from "clsx";
export const className = ({
	hover,
	selected,
}: { hover: boolean; selected: boolean }) => {
	return clsx(
		"border-b-2 border-b-transparent px-8 outline-0",
		hover && "border-b-white",
		selected && "border-b-white font-bold",
	);
};
