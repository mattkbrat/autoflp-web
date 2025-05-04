"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatCurrency, formatSalesmen } from "~/client/format";
import { api } from "~/trpc/react";
import { useAll } from "./hooks";

export const InventoryTable = () => {
	const inventory = useAll();

	const search = useSearchParams();

	const directSearch = new URLSearchParams(search);
	directSearch.delete("view");
	return (
		<table className="table">
			<thead>
				<tr>
					<th />
					<th scope="col">Salesman</th>
					<th scope="col">Make</th>
					<th scope="col">Model</th>
					<th scope="col">Year</th>
					<th scope="col">Color</th>
					<th scope="col">Down</th>
					<th scope="col">
						$ <span className="text-red-300">*</span>
					</th>
				</tr>
			</thead>
			<tbody>
				{inventory?.data?.map((i, n) => {
					const salesman = formatSalesmen(
						i.salesmen,
						i.salesmen.length === 1 ? "firstName" : "firstInitial",
					);

					const link = new URLSearchParams(directSearch);
					link.set("inv", i.id);

					return (
						<tr key={i.id} className="hover:font-extrabold">
							<th scope="row">
								<Link
									href={`/inventory?${link.toString()}`}
									className="hover:underline"
								>
									<span>
										{n + 1}
										<span>)</span>
									</span>
								</Link>
							</th>
							<td>{salesman}</td>
							<td className="break-all">{i.make}</td>
							<td>{i.model}</td>
							<td>{i.year}</td>
							<td>{i.color}</td>
							<td>{formatCurrency(i.down)}</td>
							<td>{formatCurrency(i.price)}</td>
						</tr>
					);
				})}
			</tbody>
			<tfoot>
				<tr>
					<td colSpan={10}>
						<span className="text-red-300">*</span> Does not include APR %. Cash
						sales can be discounted up to 25% of listed price.
					</td>
				</tr>
			</tfoot>
		</table>
	);
};
