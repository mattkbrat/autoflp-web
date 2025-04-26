"use client";

import {
	Button,
	Tab,
	TabGroup,
	TabList,
	TabPanel,
	TabPanels,
} from "@headlessui/react";
import clsx from "clsx";
import { parseAsString, useQueryState } from "nuqs";
import { Fragment, useDeferredValue, useEffect } from "react";
import { InventoryCombobox } from "./Combobox";
import { Form } from "./Form";
import { StateButton } from "./StateButton";
import { InventoryTable } from "./Table";

const className = ({
	hover,
	selected,
}: { hover: boolean; selected: boolean }) => {
	return clsx(
		"border-b-2 border-b-transparent px-8 outline-0",
		hover && "border-b-white",
		selected && "border-b-white font-bold",
	);
};

export const View = () => {
	const [view, setView] = useQueryState("view", parseAsString);
	const [inv] = useQueryState("inv");
	const deferred = useDeferredValue(inv);

	// Move client back to manage form when
	// - the view query state updates and
	// - the view is not already on manage
	useEffect(() => {
		if (view === "manage" || inv === deferred) return;
		setView("manage");
	}, [inv, setView, deferred, view]);

	const isTable = view === "table";

	return (
		<>
			<div className="flex flex-wrap items-end gap-x-4 gap-y-2">
				<InventoryCombobox />
				<StateButton />
			</div>
			<TabGroup className={"w-full"} selectedIndex={isTable ? 1 : 0}>
				<TabList className={"border-b-2 border-b-gray-500 print:hidden"}>
					<Tab as={Fragment}>
						{({ hover, selected }) => (
							<Button
								onClick={() => {
									setView(null);
								}}
								className={className({ hover, selected })}
							>
								Manage
							</Button>
						)}
					</Tab>
					<Tab as={Fragment}>
						{({ hover, selected }) => (
							<Button
								onClick={() => {
									setView("table");
								}}
								className={className({ hover, selected })}
							>
								Table View
							</Button>
						)}
					</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
						<Form />
					</TabPanel>
					<TabPanel className={"w-full"}>
						<InventoryTable />
					</TabPanel>
				</TabPanels>
			</TabGroup>
		</>
	);
};
