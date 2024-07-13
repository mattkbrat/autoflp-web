
import type { Payment } from "@prisma/client";
import { prisma } from ".";

export const getPaymentsByDeal = async (deal: string) => {
  return prisma.payment.findMany({where: {dealId: deal}})
};

export const recordPayment = async (payment: Payment) => {
  return prisma.payment.create({data: payment})
};

export const deletePayment = async (payment: string) => {
  if (!payment) {
    throw new Error("Must provide a payment ID")
  }
  return prisma.payment.delete({where: {id: payment}})
};
