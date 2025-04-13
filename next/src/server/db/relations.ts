import { relations } from "drizzle-orm/relations";
import {
	account,
	authAccount,
	authSession,
	authUser,
	charge,
	creditor,
	deal,
	dealCharge,
	dealTrade,
	defaultCharge,
	inventory,
	inventorySalesman,
	payment,
	person,
	salesman,
} from "./schema";

export const dealRelations = relations(deal, ({ one, many }) => ({
	creditor: one(creditor, {
		fields: [deal.creditor],
		references: [creditor.id],
	}),
	inventory: one(inventory, {
		fields: [deal.inventory],
		references: [inventory.vin],
	}),
	account: one(account, {
		fields: [deal.account],
		references: [account.id],
	}),
	dealCharges: many(dealCharge),
	dealTrades: many(dealTrade),
	payments: many(payment),
}));

export const creditorRelations = relations(creditor, ({ one, many }) => ({
	deals: many(deal),
	defaultCharges: many(defaultCharge),
	person: one(person, {
		fields: [creditor.contact],
		references: [person.id],
	}),
}));

export const inventoryRelations = relations(inventory, ({ many }) => ({
	deals: many(deal),
	dealTrades: many(dealTrade),
	inventorySalesmen: many(inventorySalesman),
}));

export const accountRelations = relations(account, ({ one, many }) => ({
	deals: many(deal),
	person: one(person, {
		fields: [account.contact],
		references: [person.id],
	}),
}));

export const dealChargeRelations = relations(dealCharge, ({ one }) => ({
	charge: one(charge, {
		fields: [dealCharge.charge],
		references: [charge.id],
	}),
	deal: one(deal, {
		fields: [dealCharge.deal],
		references: [deal.id],
	}),
}));

export const chargeRelations = relations(charge, ({ many }) => ({
	dealCharges: many(dealCharge),
	defaultCharges: many(defaultCharge),
}));

export const dealTradeRelations = relations(dealTrade, ({ one }) => ({
	inventory: one(inventory, {
		fields: [dealTrade.vin],
		references: [inventory.vin],
	}),
	deal: one(deal, {
		fields: [dealTrade.deal],
		references: [deal.id],
	}),
}));

export const defaultChargeRelations = relations(defaultCharge, ({ one }) => ({
	charge: one(charge, {
		fields: [defaultCharge.charge],
		references: [charge.id],
	}),
	creditor: one(creditor, {
		fields: [defaultCharge.creditor],
		references: [creditor.businessName],
	}),
}));

export const salesmanRelations = relations(salesman, ({ one, many }) => ({
	person: one(person, {
		fields: [salesman.person],
		references: [person.id],
	}),
	inventorySalesmen: many(inventorySalesman),
}));

export const personRelations = relations(person, ({ many }) => ({
	salesmen: many(salesman),
	accounts: many(account),
	creditors: many(creditor),
}));

export const inventorySalesmanRelations = relations(
	inventorySalesman,
	({ one }) => ({
		salesman: one(salesman, {
			fields: [inventorySalesman.salesman],
			references: [salesman.person],
		}),
		inventory: one(inventory, {
			fields: [inventorySalesman.vin],
			references: [inventory.vin],
		}),
	}),
);

export const authSessionRelations = relations(authSession, ({ one }) => ({
	authUser: one(authUser, {
		fields: [authSession.userId],
		references: [authUser.id],
	}),
}));

export const authUserRelations = relations(authUser, ({ many }) => ({
	authSessions: many(authSession),
	authAccounts: many(authAccount),
}));

export const authAccountRelations = relations(authAccount, ({ one }) => ({
	authUser: one(authUser, {
		fields: [authAccount.userId],
		references: [authUser.id],
	}),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
	deal: one(deal, {
		fields: [payment.deal],
		references: [deal.id],
	}),
}));
