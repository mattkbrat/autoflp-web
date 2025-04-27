import { createSelectSchema } from "drizzle-zod";
import { db } from "../.."
import { payment } from "../../schema";
import type { z } from "zod";

export const paymentsSelect = createSelectSchema(payment);
export type Payment = z.infer<typeof paymentsSelect>;
export type Payments = Payment[]

export const getPayments = async (id: string) => db.query.payment.findMany({
  where({ deal }, { eq }) {
    return eq(deal, id)
  },
})
