import { Button, Tab, TabGroup, TabList } from "@headlessui/react";
import clsx from "clsx";
import { parseAsString, useQueryState } from "nuqs";
import { Fragment, useEffect, useState } from "react";
import { formatInventory } from "~/client/format";
import { api } from "~/trpc/react";
import { className } from "../../utils/tab-class";

export const Tabs = () => {
	const [account] = useQueryState("account");
	const [deal, setDeal] = useQueryState("deal", parseAsString);
	const [hover, setHover] = useState("");
	const deals = api.deal.get.byAcocunt.useQuery(account);
	const detailed = api.deal.get.detailed.usePrefetchQuery(hover);

	const selected = deals.data?.findIndex((d) => d.id === deal);

	useEffect(() => {
		if (!deals.data?.[0] || selected !== -1) return;
		setDeal(deals.data[0].id);
	}, [deals.data, selected, setDeal]);

	return (
		<TabGroup
			className={"w-full"}
			selectedIndex={selected === -1 ? 0 : selected}
		>
			<TabList className={"border-b-2 border-b-gray-500 print:hidden"}>
				{deals.data?.map((deal) => {
					return (
						<Tab as={Fragment} key={deal.id}>
							{({ hover, selected }) => (
								<Button
									onMouseEnter={() => {
										setHover(deal.id);
									}}
									onClick={() => {
										setDeal(deal.id);
									}}
									className={clsx(className({ hover, selected }), {
										"text-gray-600": deal.state === 0,
									})}
								>
									{formatInventory(deal.inventory)}
									<br />
									{deal.date}
								</Button>
							)}
						</Tab>
					);
				})}
			</TabList>
		</TabGroup>
	);
};
