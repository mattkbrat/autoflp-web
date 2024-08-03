import type { Inventory as ComInv } from "@prisma/autosales";
import type { Inventory as LocalInv } from "@prisma/client";
import { getInvTitle } from "./getInvTitle";

export function applyLocal(data: Partial<ComInv>, local: Partial<LocalInv>) {
	data.vin = local.vin;
	data.body = local.body;
	data.fuel = local.fuel;
	data.year = local.year;
	data.make = local.make;
	data.color = data.color || local.color;
	data.model = data.model || local.model;
	data.mileage = data.mileage || local.mileage;
	data.price = data.price || Number(local.credit || local.cash || 0);
	data.title = data.title || getInvTitle(data);
	return data;
}
