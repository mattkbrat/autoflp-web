import { randomUUID } from "node:crypto";
import { and, arrayContained, arrayContains, eq, not, or } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../..";
import { inventory, inventorySalesman, salesman } from "../../schema";

export const inventorySchema = createInsertSchema(inventory).merge(z.object({
  vin: z.string().length(17),
  salesmen: z.string().array().min(1, {
    message: "Must select at least one salesman"
  }),
  mileage: z.string(),
  year: z.string()
})).refine(data => {
  const dataYear = Number(data.year)
  const currentYear = new Date().getFullYear();
  console.log({ dataYear, currentYear, diff: currentYear - dataYear, })
  if (currentYear - dataYear < 13) return true;
  return Number.isFinite(Number(data.mileage)) || data.mileage.toLowerCase() === 'exempt'
}, { message: "Must provide either a number or 'exempt' for odomoter ", path: ['odometer'] })
  .refine(data => {
    const dataYear = Number(data.year)
    const currentYear = new Date().getFullYear();
    if (currentYear - dataYear > 13) return true;
    return Number.isFinite(Number(data.mileage))

  }, { message: "Inventory manufactured fewer than 13 years ago must have an odometer reading recorded", path: ['odometer'] });

export type InventorySchema = z.infer<typeof inventorySchema>;

// @TODO: notifications -- create invnentory update notification.
export const upsertInventory = async (o: InventorySchema) =>
  db.transaction(async (tx) => {
    const now = new Date().toISOString();
    o.dateModified = now;


    let upsertedId = ""


    const [exists] = await tx
      .select({ vin: inventory.vin, id: inventory.id })
      .from(inventory)
      .where(
        or(eq(inventory.vin, o.vin), o.id ? eq(inventory.id, o.id) : undefined),
      );


    if (exists?.vin) {
      await tx.delete(inventorySalesman).where(
        eq(inventorySalesman.vin, o.vin),
      )

    } else {
      o.id = randomUUID();
      o.dateAdded = now;
      const [created] = await tx
        .insert(inventory)
        .values(o)
        .returning({ id: inventory.id });

      if (!created?.id) throw new Error("Failed to create inventory");

      upsertedId = created.id

    }

    if (exists?.vin) {
      if (!exists?.id) o.id = randomUUID();
      await tx.update(inventory).set(o).where(eq(inventory.vin, exists.vin));

      upsertedId = exists.id;
    }
    await tx.insert(inventorySalesman).values
      (
        o.salesmen.map((s) => {
          return {
            salesman: s,
            vin: o.vin,
            id: randomUUID()
          }
        })
      ).onConflictDoNothing()

    return upsertedId;
  });
