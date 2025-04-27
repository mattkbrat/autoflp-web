import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../..";
import { inventory, inventorySalesman, person, salesman } from "../../schema";
import { int, lower } from "../../util/sql";
import type { AsyncReturnType } from "~/types/utility";
import { basicContact } from "../account/get";
import { state } from "~/utils/zod/state";

export const inventorySelect = createSelectSchema(inventory);
export type Inventory = z.infer<typeof inventorySelect>;

export const salesmanSelect = createSelectSchema(salesman);
export type Salesman = z.infer<typeof salesmanSelect>;

export const inventoryFilter = z.object({
  state,
});

export type InventoryFilter = z.infer<typeof inventoryFilter>;


export const getAllInventory = async (filter?: InventoryFilter) =>
  db
    .select({
      make: inventory.make,
      model: inventory.model,
      year: int(inventory.year).as("year"),
      id: inventory.id,
      vin: sql<string>`substr(${inventory.vin}, -6)`.as("vin"),
      color: inventory.color,
      price: int(inventory.price).as('price'),
      down: int(inventory.down).as('down'),
      salesman: basicContact
    })
    .from(inventory)
    .innerJoin(inventorySalesman, eq(inventorySalesman.vin, inventory.vin))
    .innerJoin(person, eq(inventorySalesman.salesman, person.id))
    .where(
      and(
        filter && filter.state != null
          ? eq(inventory.state, filter.state)
          : undefined,
      ),
    )
    .orderBy(
      asc(lower(inventory.make)),
      asc(lower(inventory.model)),
      desc(lower(inventory.year)),
    ).all()

export type AllInventory = NonNullable<AsyncReturnType<typeof getAllInventory>>;

export type AggregatedInventory = (Omit<AllInventory[number], 'salesman'> & {
  salesmen: NonNullable<AllInventory[number]['salesman']>[]
})[]

export const aggregateInventory = (inventory: AllInventory) => {


  return inventory.reduce((acc, { salesman, ...curr }) => {

    const index = acc.findIndex((a) => a.vin === curr.vin);

    if (index !== -1) {
      if (salesman)
        acc[index]?.salesmen.push(salesman)
      return acc
    }

    acc.push(Object.assign(curr, { salesmen: salesman ? [salesman] : [] }))


    return acc



  }, [] as AggregatedInventory)

}

export const getInventoryByVin = async (vin: string) =>
  db
    .query.inventory.findFirst({
      with: {
        inventorySalesmen: {
          columns: {
            id: true,
          },
          with: {
            salesman: {
              columns: {
                id: true
              },
              with: {
                person: {
                  columns: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }

      },
      where({ vin: invVin, id }, { or, eq }) {

        return or(eq(lower(invVin), vin.toLowerCase()), eq(id, vin))
      },
    })

export type ExtendedInventory = NonNullable<AsyncReturnType<typeof getInventoryByVin>>;

export const getSalesmen = async () =>
  db.query.salesman.findMany({
    with: {
      person: true
    },
    where({ state }, { eq }) { return eq(state, 1) }
  })
