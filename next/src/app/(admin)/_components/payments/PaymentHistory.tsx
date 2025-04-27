import { Button } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useMemo, useState } from "react";
import { formatCurrency } from "~/client/format";
import type { PaymentsSchedule } from "~/lib/finance/payment-history";
export const History = ({ schedule }: { schedule: PaymentsSchedule }) => {
	const [missing, setMissing] = useState(false);
	const [future, setFuture] = useState(false);
	const [expanded, setExpanded] = useState<string[]>([]);
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
		<section className="min-w-max flex-1">
			<div className="btn-group flex justify-between gap-2 print:hidden">
				<h2 className="self-center text-lg tracking-wide underline underline-offset-2">
					Payment History
				</h2>
				<div>
					<label className="flex items-center gap-x-2">
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
					<label className="flex items-center gap-x-2">
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
					<Button
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
						const isExpanded = expanded.includes(row.dateFmt);
						return (
							<Fragment key={row.dateFmt}>
								<tr
									className={clsx({
										"!bg-gray-400 dark:!bg-gray-800 border-4": isCurrentMonth,
										"dark:text-gray-200": !dateAfter && !isCurrentMonth,
									})}
								>
									<td className="inline-flex w-full ">
										{row.paid ? (
											<Button
												className={"button p-1 "}
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
												<tr key={payment.id} className="text-base">
													<td>{payment.date}</td>
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
