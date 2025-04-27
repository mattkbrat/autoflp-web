import { formatCurrency } from "~/client/format";
import type { PaymentsSchedule } from "~/lib/finance/payment-history";
import type { Payments } from "~/server/db/queries/deal/get-payments";

export const PaymentsTable = ({
	selected,
	schedule,
	payments,
}: {
	selected: {
		state: number;
		id: string;
		pmt: number;
	};
	schedule: PaymentsSchedule;
	payments: Payments;
}) => {
	const totalOwed = schedule?.remaining;

	return (
		<section className="flex min-w-max flex-1 flex-col content-center bg-black/20 pb-4 print:hidden">
			<h2 className="text-lg tracking-wide underline underline-offset-2">
				Admin Panel
			</h2>
			<div className="grid w-full grid-cols-[1fr_1fr_auto] gap-2 self-start">
				<section
					id="heading"
					className="contents font-bold text-lg text-primary-300"
				>
					<span>Date</span>
					<span>$ (USD)</span>
					<span />
				</section>
				<section id="body" className="contents">
					<form
						method="post"
						className="contents"
						action="?/record"
						// use:enhance={() => {
						//   return async ({ update }) => {
						//     await update({ reset: false });
						//   };
						// }}
					>
						<input
							value={new Date().toISOString().split("T")[0]}
							name="date"
							type="date"
							className="input"
							id="pmt-date-input"
							disabled={!selected.state}
						/>
						<input
							type="number"
							name="pmt"
							id={"pmt-amount"}
							min={0}
							step={0.01}
							className="input"
							defaultValue={selected.pmt}
							disabled={!selected.state}
						/>
						<input
							type="hidden"
							name="balance"
							value={totalOwed}
							required
							className="input"
						/>
						<button
							type="submit"
							className="btn preset-filled-success-800-200"
							disabled={!selected.state}
						>
							Save
						</button>
						<input type="hidden" name="id" value={selected.id} />
						<input type="hidden" name="state" value={selected.state} />
						<input type="hidden" name="payoff" value={schedule?.payoff} />
						<hr className="col-span-full" />
						<span className="underline underline-offset-2">Date</span>
						<span className="underline underline-offset-2">Amount</span>
						<span className="underline underline-offset-2">Select</span>
						{payments.map((pmt) => (
							<label className="contents" key={pmt.id}>
								<span>{pmt.date.split(" ")[0]}</span>
								<span>{formatCurrency(pmt.amount)}</span>
								<input
									className="checkbox"
									type="checkbox"
									value={pmt.id}
									name={"pmt-id"}
								/>
							</label>
						))}
						<hr className="col-span-full" />
						<div className="col-span-full flex flex-row gap-1">
							<button
								className="btn preset-outlined-secondary-200-800 h-full flex-1"
								type="button"
								onClick={() => {
									defaultPmt.amount = schedule?.payoff || 0;
								}}
							>
								Apply Remaining Owed
							</button>
							<button
								type="submit"
								className="btn !h-fit flex flex-1 flex-col gap-y-1"
								className:preset-outlined-secondary-200-800={!selected.state}
								className:preset-outlined-warning-200-800={selected.state}
								formaction="?/toggleState"
							>
								<span>{selected.state ? "Close Deal" : "Open Deal"}</span>
							</button>
							<button
								type="submit"
								className="btn preset-outlined-warning-200-800 flex h-full flex-1 flex-col gap-y-1"
								formaction="?/delete"
							>
								Remove Selected
							</button>
						</div>
						<div className="col-span-full flex flex-row gap-1">
							<button
								type="submit"
								className="btn !h-fit preset-outlined-tertiary-200-800 flex flex-1 gap-y-1"
								formaction="?/getBill"
							>
								Get Bill
							</button>
							<button
								type="submit"
								className="btn !h-fit preset-outlined-tertiary-200-800 col-span-full flex gap-y-1"
								formaction="?/getForms"
							>
								Get Forms
							</button>
						</div>
					</form>
				</section>
			</div>
		</section>
	);
};
