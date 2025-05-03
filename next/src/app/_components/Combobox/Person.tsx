"use client";
import {
	Button,
	Combobox,
	ComboboxButton,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Field,
	Label,
} from "@headlessui/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type SetStateAction, useState } from "react";

type Person = { id: number; name: string };

const people: Partial<Person>[] = [
	{ id: 2, name: "Kenton Towne" },
	{ id: 3, name: "Therese Wunsch" },
	{ id: 4, name: "Benedict Kessler" },
	{ id: 5, name: "Katelyn Rohan" },
];

const param = "name";

export function PersonCombobox() {
	const router = useRouter();
	const path = usePathname();
	const search = useSearchParams();

	const [query, setQuery] = useState("");
	const queryParam = search.get(param);
	const [selected, setSelected] = useState(
		(queryParam && people.find((p) => p.id === Number(queryParam))) || null,
	);

	const filteredPeople =
		query === ""
			? people
			: people.filter((person) => {
					return person.name?.toLowerCase().includes(query.toLowerCase());
				});

	return (
		<Field className="space-y-2">
			<Label htmlFor="person_combobox">Person</Label>
			<Combobox
				value={selected}
				onChange={(value) => {
					setSelected(value);

					const query = new URLSearchParams(search);
					if (value?.id) {
						query.set(param, String(value.id));
					} else {
						query.delete(param);
					}
					router.replace(`${path}?${query.toString()}`);
				}}
				onClose={() => setQuery("")}
			>
				<div className="relative w-max">
					<ComboboxInput
						id="person_combobox"
						className={"cb_input"}
						displayValue={(person: Person) => person?.name}
						onChange={(event) => setQuery(event.target.value)}
					/>
					<ComboboxButton className="group cb_button">
						<span className="icon">v</span>
					</ComboboxButton>
				</div>

				<ComboboxOptions anchor="bottom" transition className={"cb_opts"}>
					{filteredPeople.map((person) => (
						<ComboboxOption
							key={person.id}
							value={person}
							className="group opt"
						>
							{/* <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" /> */}
							<div className="text-sm/6">{person.name}</div>
						</ComboboxOption>
					))}
				</ComboboxOptions>
			</Combobox>
		</Field>
	);
}
