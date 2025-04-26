"use client";
import { BaseCombobox } from "~/app/_components/Combobox/Base";
import { formatInventory } from "~/client/format";
import { useAll } from "./hooks";

export function InventoryCombobox() {
	const inventory = useAll();
	return (
		<BaseCombobox
			options={inventory.data || []}
			param={"id"}
			label="inv"
			// @ts-expect-error: It wants year to be a string, but it's getting cast to int in select. This is fine.
			displayFunction={(p) => (p ? formatInventory(p) : "")}
			optionFunction={{
				type: "node",
				function: (p) => (
					<div
						className={"grid w-full grid-cols-[auto_1fr_1fr] gap-x-2 uppercase"}
					>
						<span>{p.year}</span>
						<span>{p.make}</span>
						<span>{p.model}</span>
						<span className="col-span-full text-xs">{p.vin}</span>
					</div>
				),
			}}
		/>
	);
}
