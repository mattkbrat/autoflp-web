"use client";
import { api } from "~/trpc/react";

export const BusinessMark = () => {
	const info = api.business.info.useQuery();

	const data = info.data;
	return (
		<div className="mt-auto grid w-full grid-cols-3 border-black border-t-2 print:text-sm">
			<span className="text-left font-extrabold">{data?.name}</span>
			<span className="text-center">{data?.phone}</span>
			<span className="text-right">{data?.address}</span>
		</div>
	);
};
