import { Button } from "@headlessui/react";
import clsx from "clsx";
import { parseAsBoolean, useQueryState } from "nuqs";
import { Fragment, useMemo, useState } from "react";
import { formatCurrency } from "~/client/format";
import type { PaymentsSchedule } from "~/lib/finance/payment-history";
import { api } from "~/trpc/react";
export const History = ({
	schedule,
	account,
	deal,
	refetch,
}: {
	schedule: PaymentsSchedule;
	account: string;
	deal: string;
	refetch: () => void;
}) => {
	const [missing, setMissing] = useQueryState(
		"show-missing",
		parseAsBoolean.withDefault(false),
	);
	const [future, setFuture] = useQueryState(
		"show-future",
		parseAsBoolean.withDefault(false),
	);
	const [expanded, setExpanded] = useState<string[]>([]);

	const deleteHandler = api.deal.delete.payment.useMutation();

	const filteredSchedule = useMemo(
		() =>
			schedule.schedule?.filter((r) => {
				if (r.monthType === "after") return future;
				if (r.monthType === "before" && r.paid === 0) return missing;
				return true;
			}),
		[future, missing, schedule],
	);

	return (
		<section className="max-w-full flex-1 overflow-auto">
			<div className="flex flex-wrap justify-between gap-2 print:hidden">
				<h2 className="self-center tracking-wide underline underline-offset-2 lg:text-lg">
					Payment History
				</h2>
				<div className="flex gap-x-2 print:hidden">
					<label className="flex select-none items-center gap-x-2">
						<input
							type="checkbox"
							id="showMissingPayments"
							className="input aspect-square w-4"
							checked={missing}
							onChange={(e) => {
								setMissing(e.target.checked);
							}}
						/>
						Missing Payments
					</label>
					<label className="flex select-none items-center gap-x-2">
						<input
							type="checkbox"
							id="showFuturePayments"
							className="input aspect-square w-4"
							checked={future}
							onChange={(e) => {
								setFuture(e.target.checked);
							}}
						/>
						Future Payments
					</label>
				</div>
				<div>
					<Button
						className={"button text-sm"}
						onClick={() => {
							setExpanded(
								expanded.length === schedule.schedule.length
									? []
									: schedule.schedule.map((s) => s.dateFmt),
							);
						}}
					>
						Expand all
					</Button>
				</div>
			</div>
			<table className="table">
				<thead className="text-center">
					<tr>
						<th className="print:hidden" />
						<th>Date</th>
						<th>B. Bal</th>
						<th>Paid</th>
						<th>Expected</th>
						<th>T. Paid</th>
						<th>E. Bal</th>
						<th>Advanced</th>
					</tr>
				</thead>
				<tbody className="text-right font-mono">
					{filteredSchedule.toReversed().map((row) => {
						const dateAfter = row.monthType === "after";
						const isCurrentMonth = row.monthType === "current";
						const isExpanded =
							row.payments.length > 1 && expanded.includes(row.dateFmt);
						return (
							<Fragment key={row.dateFmt}>
								<tr
									className={clsx({
										"border-4 ": isCurrentMonth,
										"dark:text-gray-200": !dateAfter && !isCurrentMonth,
									})}
								>
									<td className="space-x-4 print:hidden">
										{row.payments.length ? (
											<>
												{row.payments.length > 1 ? (
													<Button
														className={" button p-1"}
														type="button"
														onClick={() => {
															if (!isExpanded) {
																const newExpanded = [...expanded];
																newExpanded.push(row.dateFmt);
																setExpanded(newExpanded);
																return;
															}
															setExpanded(
																expanded.filter((r) => r !== row.dateFmt),
															);
														}}
													>
														{isExpanded ? "-" : "+"}
													</Button>
												) : (
													""
												)}
												<Button
													onClick={() => {
														if (
															!confirm(
																`Remove ${row.payments.length} ${
																	row.payments.length > 1
																		? "payments"
																		: "payment"
																} in the month of ${row.dateFmt}, totaling ${formatCurrency(row.totalPaid)}, from ${account}`,
															)
														) {
															return;
														}
														deleteHandler
															.mutateAsync({
																month: row.date.getMonth() + 1,
																year: row.date.getFullYear(),
																deal,
															})
															.then(() => {
																refetch();
															});
													}}
												>
													Delete
												</Button>
											</>
										) : (
											""
										)}
									</td>
									<td
										className="inline-flex w-full"
										title={
											row.payments.map((r) => r.date.toString()).join(", ") ||
											row.date?.toString()
										}
									>
										<span className="ml-auto">{row.dateFmt}</span>
									</td>
									<td>{formatCurrency(row.start)}</td>
									<td>{formatCurrency(row.paid)}</td>
									<td>{formatCurrency(row.expected)}</td>
									<td>{formatCurrency(row.totalPaid)}</td>
									<td>{formatCurrency(row.owed)}</td>
									<td>{formatCurrency(row.totalDiff)}</td>
								</tr>
								{isExpanded &&
									row.payments.map(
										(payment) =>
											payment.date && (
												<tr key={payment.id}>
													<td className="print:hidden">
														<Button
															onClick={() => {
																if (
																	!confirm(
																		`Remove payment of date ${payment.date} and amount ${payment.amount} from ${account}`,
																	)
																) {
																	return;
																}
																deleteHandler
																	.mutateAsync({
																		id: payment.id,
																	})
																	.then(() => {
																		refetch();
																	});
															}}
														>
															Delete
														</Button>
													</td>
													<td>{payment.date}</td>
													<td />
													<td>{formatCurrency(payment.amount)}</td>
													<td colSpan={10} />
												</tr>
											),
									)}
							</Fragment>
						);
					})}
				</tbody>
			</table>
		</section>
	);
};
