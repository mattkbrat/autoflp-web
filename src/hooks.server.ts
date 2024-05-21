import { RequestContext } from "@mikro-orm/core";
import { AsyncLocalStorage } from "async_hooks";

import { orm } from "$lib/server/database";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	// Create a Mikro-ORM context that exists through the lifetime of the web request.
	const ctx = RequestContext.createContext(orm.em);
	// Store the Mikro-ORM context into the store for the entire execution of this async function
	RequestContext.storage.enterWith(ctx);

	const response = await resolve(event);
	return response;
};
