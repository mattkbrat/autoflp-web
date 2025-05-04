import {
	Button,
	Field,
	Fieldset,
	Input,
	Label,
	Legend,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Controller, useForm } from "react-hook-form";
import type { NewPayment } from "~/server/db/queries/payment/schema";
import { api } from "~/trpc/react";

export const PaymentForm = ({
	deal,
	defaultPmt,
	refetch,
}: {
	deal: string;
	defaultPmt: string | null;
	refetch: () => void;
}) => {
	const { register, handleSubmit, control, setValue } = useForm<NewPayment>({
		defaultValues: {
			date: new Date().toISOString(),
		},
	});
	const [date, setDate] = useState<Date | null>(new Date());

	useEffect(() => {
		setValue("deal", deal);
		setValue("amount", defaultPmt || "100");
	}, [deal, defaultPmt, setValue]);

	const mutate = api.deal.create.payment.useMutation();

	const onSubmit = async (data: NewPayment) => {
		return mutate.mutateAsync(data).then(() => {
			refetch();
		});
	};

	return (
		<div className="grid py-2">
			<div className="flex w-full flex-col gap-4 md:flex-row print:hidden print:text-sm">
				<form onSubmit={handleSubmit(onSubmit)} className="form py-2">
					<Fieldset>
						<Legend>New Payment</Legend>
						<div className="flex flex-wrap items-end gap-x-2">
							<Field>
								<Label>
									Amount
									<Input
										type="number"
										{...register("amount")}
										step={0.01}
										required
									/>
								</Label>
							</Field>
							<Field className={"flex-1"}>
								<Label>
									License Expiration
									<Controller
										control={control}
										name={"date"}
										render={({ field }) => {
											return (
												<DatePicker
													selected={date}
													onChange={(v: Date | null) => {
														setDate(v);
														field.onChange(v?.toISOString());
													}}
												/>
											);
										}}
									/>
								</Label>
							</Field>
							<Button type="submit">Submit</Button>
							<Button type="button" className={"delete"}>
								Close Deal
							</Button>
						</div>
					</Fieldset>
				</form>
				{mutate.error && (
					<p className="border-2 border-red-800 px-4 py-8">
						{mutate.error.message}
					</p>
				)}
			</div>
			<div className="flex w-full flex-wrap gap-x-4">
				<Button className={"button min-w-max flex-1 text-base"} type="button">
					Apply Remaining Owed
				</Button>
				<Button className={"button min-w-max flex-1 text-base"} type="button">
					Get Bill
				</Button>
				<Button className={"button min-w-max flex-1 text-base"} type="button">
					Download Forms
				</Button>
			</div>
		</div>
	);
};
