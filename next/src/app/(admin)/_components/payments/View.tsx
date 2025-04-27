"use client";
import { addMonths } from "date-fns";
import { useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import { PersonCombobox } from "~/app/_components/Combobox/Person";
import {
	formatInventory,
	formatSalesmen,
	fullNameFromPerson,
} from "~/client/format";
import { parseAsState } from "~/client/nuqs/parser";
import { getPaymentSchedule } from "~/lib/finance/payment-history";
import { api } from "~/trpc/react";
import { StateButton } from "../StateButton";
import { History } from "./PaymentHistory";
import { Tabs } from "./Tabs";

const stateQueryKey = "account-state";

export const View = () => {
	const [id] = useQueryState("deal");

	const [accountState] = useQueryState(stateQueryKey, parseAsState);

	const detailed = api.deal.get.detailed.useQuery(id);

	const salesman = formatSalesmen(
		detailed.data?.inventory.inventorySalesmen,
		"contact",
	);

	const deal = useMemo(() => detailed.data, [detailed]);

	const schedule = useMemo(() => {
		if (!deal) return null;
		return getPaymentSchedule(
			{
				pmt: Number(deal?.pmt),
				term: Number(deal?.term),
				balance: Number(deal?.lien),
				startDate: addMonths(new Date(deal?.date), 1),
				finance: Number(deal?.finance),
				apr: Number(deal?.apr),
			},
			deal?.payments,
		);
	}, [deal]);

	console.log(schedule);

	const [_, setInv] = useQueryState("inv");
	useEffect(() => {
		if (!detailed.data) return;
		setInv(detailed.data?.inventory.id);
	}, [detailed.data, setInv]);

	return (
		<>
			<StateButton queryKey={"account-state"} />
			<PersonCombobox state={accountState} />
			<Tabs />

			{detailed.data && (
				<>
					<h2 className="relative flex flex-col items-center bg-black/20 py-2 uppercase">
						<span className="text-lg tracking-tight">
							{fullNameFromPerson({ person: detailed.data?.account.person })}
						</span>
						<span className={"text-2xl"}>
							{formatInventory(detailed.data.inventory)}
						</span>
						{salesman && (
							<span className="absolute top-2 right-2 text-gray-300 print:hidden">
								{salesman}
							</span>
						)}
					</h2>
					{schedule && <History schedule={schedule} />}
					<pre className="print:hidden">
						{JSON.stringify(detailed.data, null, 2)}
					</pre>
				</>
			)}
		</>
	);
};
