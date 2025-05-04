import { and, eq } from "drizzle-orm"
import { db } from "../.."
import { payment } from "../../schema"
import type { paymentWhereSchema } from "./schema"
import type { z } from "zod"

export const getPayments = async (schema: z.infer<typeof paymentWhereSchema>) => {
  db.select().from(payment).where(and(
    schema.id ? eq(payment.id, schema.id) : undefined,
    schema.deal ? eq(payment.deal, schema.deal) : undefined
  ))
}
