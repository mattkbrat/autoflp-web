
import { createSelectSchema } from "drizzle-zod"
import { payment } from "../../schema";
import { z } from "zod";
export const paymentSelectSchema = createSelectSchema(payment);
export type PaymentSelect = z.infer<typeof paymentSelectSchema>;

export const paymentDeleteSchema =
  paymentSelectSchema.pick({
    'amount': true, 'date': true, 'deal': true
  }).or(paymentSelectSchema.pick({ id: true })).or(
    paymentSelectSchema.pick({ deal: true }).and(
      z.object({
        month: z.number(),
        year: z.number(),
        deal: z.string()
      })
    )
  )

export const paymentWhereSchema = paymentSelectSchema.pick({ id: true, deal: true }).partial()

export const paymentCreateSchema = paymentSelectSchema.pick({
  deal: true,
  amount: true,
  date: true,
})

export type NewPayment = z.infer<typeof paymentCreateSchema>
