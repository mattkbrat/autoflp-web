import type { listObjects } from "$lib/server/s3";
import type { AsyncReturnType } from "..";
import type { ArrayElement } from "../ArrayElement";
import type { Image } from "@prisma/autosales";

export type * from "./credit";

export type {
	ComInventory,
	ComInventoryWithUrl,
	ComSingleInventory,
} from "$lib/server/database/com";

export type ImageWithLogic = ArrayElement<AsyncReturnType<typeof listObjects>> &
	Image & {
		render: boolean;
		replace: boolean;
		file: FileList | null;
		id: number;
	};
