import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../..";
import { inventory } from "../../schema";

export const deleteInventorySchema = z.object({
	vin: z.string(),
});

export type DeleteInventory = z.infer<typeof deleteInventorySchema>;

export const deleteInventory = async (o: DeleteInventory) =>
	db.delete(inventory).where(eq(inventory.vin, o.vin));
