"use client";
import clsx from "clsx";
import { addMonths, differenceInDays, formatDate } from "date-fns";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import { PersonCombobox } from "~/app/_components/Combobox/Person";
import {
	formatCurrency,
	formatInventory,
	formatSalesmen,
	fullNameFromPerson,
} from "~/client/format";
import { parseAsState } from "~/client/nuqs/parser";
import { getPaymentSchedule } from "~/lib/finance/payment-history";
import { api } from "~/trpc/react";
import { StateButton } from "../StateButton";
import { PaymentForm } from "./Form";
import { History } from "./PaymentHistory";
import { Tabs } from "./Tabs";

const stateQueryKey = "account-state";

export const View = () => {
	const now = new Date();
	const [id] = useQueryState("deal");

	const [accountState] = useQueryState(stateQueryKey, parseAsState);
	const [missing, setMissing] = useQueryState(
		"show-missing",
		parseAsBoolean.withDefault(false),
	);
	const [future, setFuture] = useQueryState(
		"show-future",
		parseAsBoolean.withDefault(false),
	);

	const detailed = api.deal.get.detailed.useQuery(id);

	const salesman =
		detailed.data?.inventory &&
		formatSalesmen(
			detailed.data.inventory.inventorySalesmen.map((s) => s.salesman.person),
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

	const [_, setInv] = useQueryState("inv");
	useEffect(() => {
		if (!detailed.data) return;
		setInv(detailed.data?.inventory.id);
	}, [detailed.data, setInv]);

	const fullName = detailed.data
		? fullNameFromPerson({
				person: detailed.data.account.person,
			})
		: "";

	const pmtIsLate = schedule ? differenceInDays(now, schedule.nextDueDate) : 0;

	const isLate = (schedule?.totalDiff || 0) < 0;
	return (
		<>
			<StateButton queryKey={"account-state"} />
			<PersonCombobox state={accountState} />
			<Tabs />

			{detailed.data && (
				<>
					{id && (
						<PaymentForm
							deal={id}
							defaultPmt={detailed.data.pmt}
							refetch={() => {
								detailed.refetch();
							}}
						/>
					)}
					<hr />
					<div className="relative flex ">
						<h2 className="flex flex-1 flex-col items-center py-2 uppercase">
							<span className="text-lg tracking-tight">{fullName}</span>
							<span className={"text-2xl"}>
								{formatInventory(detailed.data.inventory)}
							</span>
						</h2>

						<div className="absolute top-2 right-2 print:hidden">
							{salesman && <span>{salesman}</span>}
						</div>
					</div>
					<div className="flex flex-row flex-wrap justify-around py-2 text-center uppercase">
						<span>
							<span className="text-lg">
								{formatCurrency(detailed.data.lien)}
							</span>
							<br />
							Lien
						</span>
						<span>
							<span className="text-lg">
								{formatCurrency(schedule?.totalPaid)}
							</span>
							<br /> paid
						</span>
						<span>
							<span className="text-lg">
								{formatCurrency(schedule?.totalExpected)}
							</span>
							<br />
							Expected
						</span>
						{detailed?.data.lien &&
							schedule &&
							Math.abs(schedule.totalDiff) > 5 && (
								<span hidden={!schedule?.totalDiff}>
									<span className="text-lg">
										<span>
											{formatCurrency(Math.abs(schedule?.totalDiff || 0))}
										</span>
									</span>
									<br />
									{isLate ? "delinquent" : "advanced"}
									<br />
									{schedule?.monthsDelinquent && (
										<span
											className={clsx("text-sm", {
												"text-red-400": schedule.totalDiff < 0,
											})}
										>
											{Math.abs(schedule?.monthsDelinquent)} mo.
										</span>
									)}
								</span>
							)}
						<span hidden={!detailed.data.state}>
							<span className="text-lg">
								{formatCurrency(schedule?.payoff)}
							</span>
							<br /> Payoff
						</span>
						<span>
							<span className="text-lg">
								{formatCurrency(schedule?.remaining)}
							</span>
							<br />

							<span>{detailed.data.state ? "remaining" : "saved"}</span>
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span>
							{Number(detailed.data.term)} Month term
							{schedule?.startDate && (
								<span className="text-center">
									{" "}
									starting
									<br />
									<span className="text-lg">
										{formatDate(schedule.startDate, "MMM. do ''yy")}
									</span>
								</span>
							)}
							<br />
						</span>

						<span className="text-center">
							Monthly
							<br />
							<span className="text-lg">
								${formatCurrency(detailed.data.pmt)}
							</span>
						</span>
						<span className="text-right">
							{detailed.data.state && schedule ? (
								<span className={clsx(isLate && "text-red-400")}>
									<span>Nex payment due by</span>
									<br />
									<span className="text-lg">
										{formatDate(
											schedule.nextDueDate,
											schedule.nextDueDate.getFullYear() < now.getFullYear()
												? "MMM. do yyyy"
												: "MMM. do",
										)}
									</span>
									{pmtIsLate < 60
										? "!!!"
										: pmtIsLate < 30
											? "!!"
											: pmtIsLate > 7
												? "!"
												: ""}
									<br />
								</span>
							) : (
								<span>Thank you!</span>
							)}
						</span>
					</div>
					<hr />
					{schedule && id && (
						<History
							schedule={schedule}
							account={fullName}
							deal={id}
							refetch={() => {
								detailed.refetch();
							}}
						/>
					)}
				</>
			)}
		</>
	);
};
