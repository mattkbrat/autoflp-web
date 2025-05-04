import { randomUUID } from "node:crypto";
import { db } from "../..";
import { payment } from "../../schema";
import type { NewPayment } from "./schema";
import { eq } from "drizzle-orm";

export const createPayment = async (s: NewPayment) => db.transaction(async (tx) => {

  const [exists] = await tx.select({ amount: payment.amount }).from(payment).where(
    eq(payment.date, s.date)
  )

  const id = randomUUID()

  if (exists) {
    return tx.update(payment).set(Object.assign(s, {
      id,
      amount: String(Number(exists.amount) + Number(s.amount))
    })).where(eq(payment.date, s.date)).returning({ amount: payment.amount, date: payment.date })

  }
  return tx.insert(payment).values(Object.assign(s, {
    id
  })).returning({ amount: payment.amount, date: payment.date })

})
