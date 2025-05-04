import { unauthorized } from "next/navigation";
import { auth } from "~/server/auth";
import { BusinessMark } from "../_components/BusinessMark";
import "react-datepicker/dist/react-datepicker.css";

export default async function AdminLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await auth();
	if (!session?.user) unauthorized();

	return (
		<>
			<div className="wrapper flex flex-1 flex-col flex-wrap content-start rounded-b-2xl pt-4">
				{children}
			</div>
			<footer className="wrapper">
				<hr />
				<BusinessMark />
			</footer>
		</>
	);
}
