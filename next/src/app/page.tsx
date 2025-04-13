import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
	// const hello = await api.post.hello({ text: "from tRPC" });

	return (
		<HydrateClient>
			<p>Page</p>
		</HydrateClient>
	);
}
