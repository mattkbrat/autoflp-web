import {
	Combobox,
	ComboboxButton,
	ComboboxInput,
	ComboboxOption,
	ComboboxOptions,
	Field,
	Label,
} from "@headlessui/react";
import { useQueryState } from "nuqs";
import { type ReactNode, useState } from "react";

export function BaseCombobox<T>({
	param,
	options,
	label,
	filterQuery = null,
	displayFunction,
	optionFunction,
}: {
	param: keyof (typeof options)[number];
	label: string;
	options: T[];
	filterQuery?: ((el: (typeof options)[number]) => string | undefined) | null;
	displayFunction: (el: (typeof options)[number] | null) => string;
	optionFunction?:
		| {
				type: "text";
				function: (el: (typeof options)[number]) => string;
		  }
		| {
				type: "node";
				function: (el: (typeof options)[number]) => ReactNode;
		  };
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

	const optsIsNode = optionFunction?.type === "node";
	return (
		<>
			<Field className="cb space-y-2">
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
							className={"w-max flex-1"}
							displayValue={displayFunction}
							onChange={(event) => setQuery(event.target.value)}
						/>
						<ComboboxButton className="group">
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
							const display = optionFunction?.function(option)
								? optionFunction.function(option)
								: displayFunction?.(option) || key;
							return (
								<ComboboxOption key={key} value={option} className="group opt">
									{!optsIsNode ? (
										<span>{display}</span>
									) : (
										optionFunction.function(option)
									)}
									{/* <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" /> */}
								</ComboboxOption>
							);
						})}
					</ComboboxOptions>
				</Combobox>
			</Field>
		</>
	);
}
