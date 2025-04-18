"use client";
import { api } from "~/trpc/react";
import { BaseCombobox } from "./Base";

export function PersonCombobox() {
	const accounts = api.account.get.all.useQuery();
	return (
		accounts.data && (
			<BaseCombobox
				options={accounts.data}
				param={"id"}
				label="Account"
				displayFunction={(p) =>
					p?.person
						? `${p.person.lastName}, ${p.person.firstName}`.toUpperCase()
						: p?.id || ""
				}
			/>
		)
	);
}
