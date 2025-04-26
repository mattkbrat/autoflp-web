import { Field, Fieldset, Input, Label, Legend } from "@headlessui/react";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { fullNameFromPerson } from "~/client/format";
import type { ExtendedInventory } from "~/server/db/queries/inventory/get";
import { api } from "~/trpc/react";

export const SalesmenCheckboxes = ({
	current,
}: { current: ExtendedInventory | null }) => {
	const context = useFormContext();

	const salesmen = api.inventory.get.salesmen.useQuery();
	useEffect(() => {
		if (!current) return;
		context.setValue(
			"salesmen",
			current.inventorySalesmen.map((i) => i.salesman.person.id),
		);
	}, [context.setValue, current]);

	const currentIds: undefined | string[] = context.watch("salesmen");

	return (
		<Fieldset className={"grid w-max grid-cols-2"}>
			<Legend className={"col-span-full"}>Choose the salesmen</Legend>
			{salesmen.data?.map((s) => {
				const isChecked = currentIds?.includes(s.person.id);
				return (
					<Field key={s.id} className={"contents"}>
						<Label className={"contents"}>
							{fullNameFromPerson({ person: s.person })}
							<Input
								type="checkbox"
								name={"salesman"}
								value={s.person}
								checked={isChecked || false}
								onChange={(e) => {
									if (!e.target.checked) {
										context.setValue(
											"salesmen",
											currentIds?.filter((c) => c !== s.person.id),
										);
									} else {
										const newIds = [...(currentIds || [])];
										newIds.push(s.person.id);
										context.setValue("salesmen", newIds);
									}
								}}
							/>
						</Label>
					</Field>
				);
			})}
		</Fieldset>
	);
};
