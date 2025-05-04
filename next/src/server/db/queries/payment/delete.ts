
import { db } from "../.."
import { payment } from "../../schema"
import { z } from "zod";
import { and, eq, gte, lte } from "drizzle-orm";
import { endOfMonth, startOfMonth } from "date-fns";
import type { paymentDeleteSchema } from "./schema";

/*
  * Delete from the payments table.
  *
  * - If id is passed, remove payment by that id.
  * - If deal is passed: 
  *   - with a date filter, remove all payments in that month.
  *   - without a date filter, remove matching payment by amount 
  */
export const deletePayment = async (schema: z.infer<typeof paymentDeleteSchema>) => {

  const schemaHasYear = 'year' in schema
  const deleteFromMonth = schemaHasYear ? new Date(schema.year, schema.month - 1, 1) : null

  return db.delete(payment).where(
    'deal' in schema ?
      and(
        eq(payment.deal, schema.deal),
        deleteFromMonth != null ? and(gte(
          payment.date, startOfMonth(deleteFromMonth).toISOString().split("T")[0] as string
        ), lte(
          payment.date, endOfMonth(deleteFromMonth).toISOString().split("T")[0] as string
        )) : undefined
      ) : eq(payment.id, schema.id)
  ).returning({ id: payment.id });
}
