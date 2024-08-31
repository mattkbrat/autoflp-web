import type {
	getApplication,
	getPresignedImages,
} from "$lib/server/database/com";
import type { AsyncReturnType } from "$lib/types";
import type { PromiseReturnType } from "@prisma/client/extension";
export type CreditApplicationWithData = PromiseReturnType<
	typeof getApplication
>;

export type CreditAppImages = AsyncReturnType<typeof getPresignedImages>;
