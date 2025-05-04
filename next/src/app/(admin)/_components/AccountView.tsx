"use client";
import {
	Button,
	Field,
	Fieldset,
	Input,
	Label,
	Legend,
} from "@headlessui/react";
import { formatDate } from "date-fns";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Controller, type FieldValues, useForm } from "react-hook-form";
import type { NewAccount } from "~/server/db/queries/account/create";
import type { DeleteAccount } from "~/server/db/queries/account/delete";
import { api } from "~/trpc/react";

export const AccountView = () => {
	const [state, setState] = useQueryState("account");

	const createMutation = api.account.create.useMutation();
	const deleteMutation = api.account.delete.byId.useMutation();
	const all = api.account.get.all.useQuery();
	const accountQuery = api.account.get.byId.useQuery(state);

	const [dob, setDob] = useState<Date | null>(new Date());
	const [exp, setExp] = useState<Date | null>(new Date());

	const { register, handleSubmit, setValue, resetField, watch, control } =
		useForm<NewAccount>();

	const lastName = watch("person.lastName");

	const onSubmit = async (data: NewAccount) => {
		try {
			if (!state) {
				data.account.id = "";
				data.account.contact = "";
				data.person.id = "";
			}

			createMutation.mutateAsync(data).then((result) => {
				if (!result) return;
				all.refetch();
				accountQuery.refetch();
				setState(result.account);
			});
		} catch (e) {
			console.error(e);
		}
	};
	const onReset = () => {
		setState(null);
		resetField("account");
		resetField("person");
		setDob(null);
		setExp(new Date());
	};

	const onDelete = async (data: DeleteAccount) => {
		if (!confirm(`Delete account ${lastName}`)) return;
		deleteMutation.mutateAsync(data).then(() => {
			setState(null);
			all.refetch();
			onReset();
		});
	};

	useEffect(() => {
		if (!accountQuery.data) {
			return;
		}
		const { person, ...account } = accountQuery.data;
		setValue(
			"account",
			Object.assign(account, {
				dateOfBirth: account.birthDate,
				licenseExpiration: account.expirationDate,
			}),
		);
		if (typeof account.birthDate === "string") {
			setDob(new Date(account.birthDate));
		}
		if (typeof account.expirationDate === "string") {
			setExp(new Date(account.expirationDate));
		}
		if (person) {
			setValue("person", person);
		}
	}, [accountQuery.data, setValue]);

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="form">
			<Fieldset>
				<Legend>Account</Legend>
				<div className="flex flex-wrap gap-x-2">
					<Field className={"flex-1"}>
						<Label>
							License Number
							<Input {...register("account.licenseNumber")} required />
						</Label>
					</Field>
					<Field className={"flex-1"}>
						<Label>
							Date of birth
							<Controller
								control={control}
								name={"account.dateOfBirth"}
								render={({ field }) => {
									return (
										<DatePicker
											className="w-full"
											selected={dob}
											showYearDropdown
											onChange={(v: Date | null) => {
												setDob(v);
												field.onChange(v?.toISOString());
											}}
										/>
									);
								}}
							/>
						</Label>
					</Field>
					<Field className={"flex-1"}>
						<Label>
							License Expiration
							<Controller
								control={control}
								name={"account.licenseExpiration"}
								render={({ field }) => {
									return (
										<DatePicker
											selected={exp}
											className="w-full"
											showMonthDropdown
											showYearDropdown
											scrollableYearDropdown
											onChange={(v: Date | null) => {
												setExp(v);
												field.onChange(v?.toISOString());
											}}
										/>
									);
								}}
							/>
						</Label>
					</Field>
				</div>
				<Field>
					<Label className={"grid flex-1"}>
						Notes
						<textarea {...register("account.notes")} />
					</Label>
				</Field>
			</Fieldset>
			<Fieldset>
				<Legend className={"flex-1"}>Person</Legend>
				<Fieldset>
					<Legend className={"flex-1"}>Name</Legend>

					<div className="flex flex-wrap gap-x-2">
						<Field className={"flex-1"}>
							<Label>
								First Name
								<Input {...register("person.firstName")} required />
							</Label>
						</Field>
						<Field className={"flex-1"}>
							<Label>
								Last Name
								<Input {...register("person.lastName")} required />
							</Label>
						</Field>
						<Field>
							<Label>
								Middle Initial
								<Input {...register("person.middleInitial")} />
							</Label>
						</Field>
						<Field>
							<Label>
								Prefix
								<Input {...register("person.namePrefix")} />
							</Label>
						</Field>
						<Field>
							<Label>
								Suffix
								<Input {...register("person.nameSuffix")} />
							</Label>
						</Field>
					</div>
				</Fieldset>
				<Fieldset>
					<Legend className={"flex-1"}>Address</Legend>
					<div className="flex flex-wrap gap-x-2">
						<Field className={"flex-1"}>
							<Label>
								Line 1
								<Input {...register("person.address1")} required />
							</Label>
						</Field>
						<Field className={"flex-1"}>
							<Label>
								Line 2
								<Input {...register("person.address2")} />
							</Label>
						</Field>
						<Field className={"flex-1"}>
							<Label>
								Line 3
								<Input {...register("person.address3")} />
							</Label>
						</Field>
					</div>
					<Field className={"flex-1"}>
						<Label>
							City
							<Input {...register("person.city")} />
						</Label>
					</Field>
					<div className="flex flex-wrap gap-x-2">
						<Field className={"flex-1"}>
							<Label>
								State
								<Input {...register("person.stateProvince")} />
							</Label>
						</Field>
						<Field>
							<Label>
								Zip
								<Input {...register("person.zipPostal")} />
							</Label>
						</Field>
						<Field>
							<Label>
								(+4)
								<Input {...register("person.zip4")} />
							</Label>
						</Field>
					</div>
				</Fieldset>
				<Fieldset>
					<Label>Contact Information</Label>

					<div className="flex flex-wrap gap-x-2">
						<Field className={"flex-1"}>
							<Label>
								Primary phone
								<Input
									{...register("person.phonePrimary")}
									required
									type="tel"
								/>
							</Label>
						</Field>
						<Field className={"flex-1"}>
							<Label>
								Secondary phone
								<Input {...register("person.phoneSecondary")} type="tel" />
							</Label>
						</Field>
						<Field className={"flex-1"}>
							<Label>
								Tertiary phone
								<Input {...register("person.phoneTertiary")} type="tel" />
							</Label>
						</Field>
					</div>
					<div className="flex flex-wrap gap-x-2">
						<Field className={"flex-1"}>
							<Label>
								Primary Email
								<Input {...register("person.emailPrimary")} type="email" />
							</Label>
						</Field>
						<Field className={"flex-1"}>
							<Label>
								Secondary Email
								<Input {...register("person.emailSecondary")} type="email" />
							</Label>
						</Field>
					</div>
				</Fieldset>
			</Fieldset>
			{createMutation.error && (
				<p className="border-2 border-red-800 px-4 py-8">
					{createMutation.error.message}
				</p>
			)}
			<div className="mx-2 flex flex-wrap justify-around gap-x-2 gap-y-8 md:mx-8">
				<Button type="submit" className={"flex-1"}>
					Submit
				</Button>
				<Button type="reset" onClick={onReset} className={"flex-1/3"}>
					Reset
				</Button>
				{state && (
					<Button
						type="button"
						className={"delete flex-1 "}
						onClick={async () => {
							onDelete({ id: state });
						}}
					>
						Delete
					</Button>
				)}
			</div>
		</form>
	);
};
