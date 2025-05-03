import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function AdminLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const session = await auth();

	if (!session) redirect("/unauthorized");

	return (
		<div className="wrapper flex h-full flex-1 flex-wrap content-start rounded-b-2xl pt-4">
			{children}
		</div>
	);
}
