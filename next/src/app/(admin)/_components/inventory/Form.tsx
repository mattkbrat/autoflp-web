"use client";
import {
	Button,
	Field,
	Fieldset,
	Input,
	Label,
	Legend,
} from "@headlessui/react";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import type { InventorySchema } from "~/server/db/queries/inventory/create";
import { api } from "~/trpc/react";
import { SalesmenCheckboxes } from "../salesmen/checkboxes";
import { useAll } from "./hooks";

const oneDay = 86400000;

export const Form = () => {
	const methods = useForm<InventorySchema>();

	const { register, handleSubmit, setValue, watch, reset, getValues, control } =
		methods;

	const vin = watch("vin");
	const [state, setState] = useQueryState("inv");
	const [toggleSearchInv, setToggle] = useState(false);

	const createMutation = api.inventory.create.useMutation();
	const deleteMutation = api.inventory.delete.byId.useMutation();
	const all = useAll();
	const query = api.inventory.get.byId.useQuery(state || vin, {
		enabled: vin?.length === 17 || !!state,
	});
	const invSearch = api.inventory.search.useQuery(vin, {
		refetchInterval: oneDay * 5,
		enabled: vin?.length === 17 || toggleSearchInv,
	});

	const [infoFilter, setInfoFilter] = useState("");

	const id = useMemo(() => query.data?.id, [query.data?.id]);

	const applyValues = useCallback(() => {
		if (!query.data) return;
		for (const [k, v] of Object.entries(query.data)) {
			// @ts-expect-error: this is fine
			setValue(k as keyof InventorySchema, v);
		}
		if (!state && id) {
			setState(id);
		}
	}, [query.data, setValue, state, id, setState]);

	const onReset = useCallback(() => {
		setState(null);
		reset();
		const today = new Date().toISOString().split("T")[0];
		setValue("datePurchased", today);
	}, [reset, setState, setValue]);

	const applyNHTSAInfo = useCallback(
		(forceUpdate = false) => {
			if (!invSearch.data?.wanted) return;
			const current = forceUpdate ? null : getValues();
			const v = invSearch.data.wanted;

			!current?.model && setValue("model", v.Model);
			!current?.make && setValue("make", v.Make);
			!current?.year && setValue("year", v["Model Year"]);
			const bodyClass = v["Body Class"];
			!current?.model &&
				setValue(
					"body",
					bodyClass.includes("SUV")
						? "SUV"
						: bodyClass.includes("Sedan")
							? "Sedan"
							: bodyClass,
				);

			const fuel = v["Fuel Type - Primary"];
			!current?.fuel && setValue("fuel", fuel === "Gasoline" ? "Gas" : fuel);
		},
		[invSearch, setValue, getValues],
	);

	useEffect(() => {
		if (!invSearch.isSuccess) return;
		applyNHTSAInfo();
	}, [invSearch.isSuccess, applyNHTSAInfo]);

	useEffect(() => {
		if (state) return;

		onReset();
	}, [state, onReset]);
	useEffect(() => {
		if (!id) return;
		applyValues();
	}, [id, applyValues]);

	useEffect(() => {
		if (!query.isSuccess) return;

		applyValues();
	}, [query.isSuccess, applyValues]);

	const onSubmit = async (data: InventorySchema) => {
		console.log("submit", data);
		try {
			if (!id) {
				data.id = "";
			}

			createMutation.mutateAsync(data).then((result) => {
				if (!result) return;
				if (state === result) {
					query.refetch();
				}
				all.refetch();
				setState(result);
			});
		} catch (e) {
			console.error(e);
		}
	};

	const onDelete = async () => {
		if (!state) return;
		if (
			!confirm(`Delete inventory ${vin}? This will remove all associated deals`)
		)
			return;
		deleteMutation.mutateAsync({ vin }).then(() => {
			setState(null);
			all.refetch();
			query.refetch();
			onReset();
		});
	};

	return (
		<div className="print:!flex-col flex w-full flex-col gap-4 md:flex-row print:text-sm">
			<FormProvider {...methods}>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="form flex-1 transition-[width]"
				>
					<Fieldset>
						<Legend>State</Legend>
						<div className="flex flex-wrap gap-x-2">
							<Field className={""}>
								<Controller
									name="state"
									control={control}
									render={({ field }) => (
										<Label className={"flex h-10 gap-x-2 text-center"}>
											Active
											<Input
												className={"w-10"}
												type="checkbox"
												{...field}
												checked={field.value === 1}
												title="active"
												onChange={(e) => {
													setValue("state", e.target.checked ? 1 : 0);
												}}
											/>
										</Label>
									)}
								/>
							</Field>
							<Field className={"border-l-[1px] pl-2"}>
								<Label className={"flex h-10 gap-x-2 text-center"}>
									<span>Search NHTSA</span>
									<Input
										type="checkbox"
										className={"w-10"}
										checked={toggleSearchInv}
										disabled={!vin || vin.length < 5}
										onChange={(e) => {
											setToggle(e.target.checked);
										}}
									/>
								</Label>
							</Field>
						</div>
					</Fieldset>
					<Fieldset>
						<Legend>Purchase</Legend>
						<div className="flex flex-wrap gap-x-2">
							<Field className={"flex-1"}>
								<Label>
									Price
									<Input
										type="number"
										step="any"
										{...register("purchasePrice")}
									/>
								</Label>
							</Field>
							<label>
								Date purchased
								<input type="date" {...register("datePurchased")} />
							</label>
						</div>
					</Fieldset>
					<Fieldset>
						<Legend>Vehicle</Legend>
						<div className="flex flex-wrap gap-x-2">
							<Field className={"flex-1"}>
								<Label>
									VIN
									<Input type="text" {...register("vin")} required />
								</Label>
							</Field>
						</div>
						<div className="flex flex-wrap gap-x-2">
							<Field className={"flex-1"}>
								<Label>
									Year
									<Input type="text" {...register("year")} required />
								</Label>
							</Field>
							<Field className={"flex-1"}>
								<Label>
									Make
									<Input type="text" {...register("make")} required />
								</Label>
							</Field>
							<Field className={"flex-1"}>
								<Label>
									Model
									<Input type="text" {...register("model")} />
								</Label>
							</Field>
							<Field className={"flex-1"}>
								<Label>
									Body
									<Input type="text" {...register("body")} />
								</Label>
							</Field>
							<Field className={"flex-1"}>
								<Label>
									Color
									<Input type="text" {...register("color")} />
								</Label>
							</Field>
						</div>
						<div className="flex flex-wrap gap-x-2">
							<Field className={"flex-1"}>
								<Label>
									Mileage (Odometer)
									<Input type="text" {...register("mileage")} />
								</Label>
							</Field>
							<Field className={"flex-1"}>
								<Label>
									Fuel
									<Input type="text" {...register("fuel")} />
								</Label>
							</Field>
							<Field className={"flex-1"}>
								<Label>
									CWT
									<Input type="text" {...register("cwt")} />
								</Label>
							</Field>
						</div>
					</Fieldset>
					<Fieldset>
						<Legend>Sale</Legend>

						<div className="flex flex-wrap gap-x-2">
							<Field className={"flex-1"}>
								<Label>
									Credit Price
									<Input type="number" step={1} {...register("price")} />
								</Label>
							</Field>
							<Field className={"flex-1"}>
								<Label>
									Down
									<Input type="number" step={1} {...register("down")} />
								</Label>
							</Field>
						</div>
						<SalesmenCheckboxes current={query.data || null} />
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
						{id && (
							<Button
								type="button"
								className={"delete flex-1 "}
								onClick={async () => {
									onDelete();
								}}
							>
								Delete
							</Button>
						)}
					</div>
					{id && (
						<>
							<hr />
							<div className="flex flex-wrap gap-x-2">
								<Field>
									<Label>
										Date Added
										<Input {...register("dateAdded")} disabled />
									</Label>
								</Field>
								<Field>
									<Label>
										Last Modified
										<Input {...register("dateModified")} disabled />
									</Label>
								</Field>

								<Field>
									<Label>
										ID
										<Input {...register("id")} disabled />
									</Label>
								</Field>
							</div>
						</>
					)}
				</form>
			</FormProvider>
			<div className="grid content-start gap-y-4 bg-surface p-2 md:w-60">
				{invSearch.data && (
					<>
						<Button
							type="button"
							className={"button w-full outline-blue-300"}
							onClick={() => {
								applyNHTSAInfo(true);
							}}
						>
							Apply lookup values
						</Button>
						<details className="grid gap-y-2">
							<summary className="select-none">NHTSA Info</summary>
							<Field className={"flex flex-col gap-x-1 text-lg"}>
								<Label>Filter</Label>
								<Input
									className={"max-w-full uppercase outline"}
									value={infoFilter}
									onChange={(e) => {
										setInfoFilter(e.target.value.toLowerCase());
									}}
								/>
							</Field>
							<ul className="max-h-[80dvh] overflow-auto ">
								{Object.entries(invSearch.data?.wanted || {}).map(([k, v]) => {
									return (
										k.toLowerCase().includes(infoFilter) && (
											<li key={k}>
												<span className="uppercase underline">{k}</span>
												<br />
												<p className="break-words ">{v}</p>
											</li>
										)
									);
								})}
								<li className=" text-xl underline">
									<hr className="my-4" />
									Other Info
								</li>
								{Object.entries(invSearch.data?.info || {}).map(([k, v]) => {
									return (
										k.toLowerCase().includes(infoFilter) && (
											<li key={k}>
												<span className="underline">{k}</span>
												<br />
												<span className="break-words">{v}</span>
											</li>
										)
									);
								})}
							</ul>
						</details>
					</>
				)}
			</div>
		</div>
	);
};
