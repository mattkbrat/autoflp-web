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
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";

export function BaseCombobox<T>({
	param,
	options,
	label,
	filterQuery = null,
	displayFunction,
}: {
	param: keyof (typeof options)[number];
	label: string;
	options: T[];
	filterQuery?: ((el: (typeof options)[number]) => string | undefined) | null;
	displayFunction: (el: (typeof options)[number] | null) => string;
}) {
	const [state, setState] = useQueryState(label.toLowerCase());
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState(
		(state && options.find((p) => p[param] === state)) || null,
	);

	const filtered =
		query === ""
			? options
			: options.filter((opt) => {
					const value = (
						filterQuery?.(opt) ||
						displayFunction?.(opt) ||
						opt[param]?.toString()
					)?.toLowerCase();
					if (!value) return false;
					return value.includes(query);
				});

	const htmlFor = `${label}_cb`;

	return (
		<>
			<Field className="space-y-2">
				<Label htmlFor={htmlFor}>{label}</Label>
				<Combobox
					value={selected}
					onChange={(value) => {
						setSelected(value);

						// @ts-expect-error: Param should exist in value;
						if (value?.[param]) {
							setState(String(value[param]));
						} else {
							setState(null);
						}
					}}
					onClose={() => setQuery("")}
				>
					<div className="relative w-max">
						<ComboboxInput
							id={htmlFor}
							className={"cb_input"}
							displayValue={displayFunction}
							onChange={(event) => setQuery(event.target.value)}
						/>
						<ComboboxButton className="group cb_button">
							<span className="icon">v</span>
						</ComboboxButton>
					</div>

					<ComboboxOptions anchor="bottom" transition className={"cb_opts"}>
						<ComboboxOption value="" className="group opt">
							{/* <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" /> */}
							<div className="text-sm/6">Select</div>
						</ComboboxOption>
						{filtered.map((option) => {
							const key = option[param]?.toString();
							if (!key) return;
							const display = displayFunction?.(option) || key;
							return (
								<ComboboxOption key={key} value={option} className="group opt">
									{/* <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" /> */}
									<div className="text-sm/6">{display}</div>
								</ComboboxOption>
							);
						})}
					</ComboboxOptions>
				</Combobox>
			</Field>
		</>
	);
}
