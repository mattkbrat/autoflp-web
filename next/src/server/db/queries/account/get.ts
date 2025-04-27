import { asc, eq, getTableColumns } from "drizzle-orm";
import { createSelectSchema, type CreateSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import type { AsyncReturnType } from "~/types/utility";
import { db } from "../..";
import { account, deal, person } from "../../schema";
import { lower, strftime } from "../../util/sql";
import type { State } from "~/utils/zod/state";

export const accountSelect = createSelectSchema(account);
export type Account = z.infer<typeof accountSelect>;

export const personSelect = createSelectSchema(person);
export type Person = z.infer<typeof personSelect>;

export const basicContact = {
  id: person.id,
  lastName: person.lastName,
  firstName: person.firstName,
}

export type BasicContact = {
  id: string,
  lastName: string,
  firstName: string
}

// @TODO: We should be able to use query here, but the ordeer by does does not exist in properties for person join.
export const getAllAccounts = async (state?: State) => {

  const accounts =
    db
      .selectDistinct({
        id: account.id,
        licenceNumber: account.licenseNumber,
        person: {
          lastName: person.lastName,
          firstName: person.firstName,
          phone: person.phonePrimary,
        },
      })
      .from(account)
      .leftJoin(person, eq(person.id, account.contact));

  if (Number.isFinite(state)) {
    accounts.innerJoin(deal, eq(deal.account, account.id))

    accounts.where(
      eq(deal.state, state as 0 | 1)
    )
  }


  return accounts
    .orderBy(asc(lower(person.lastName)), asc(lower(person.firstName)));
}

export const getAccountWithPerson = async (accountId: string) =>
  db
    .select({
      ...getTableColumns(account),
      expirationDate: strftime(account.licenseExpiration).as("expirationDate"),
      birthDate: strftime(account.dateOfBirth).as("birthDate"),
      person: person,
    })
    .from(account)
    .leftJoin(person, eq(person.id, account.contact))
    .where(eq(account.id, accountId))
    .limit(1)
    .then(([r]) => r);


export const getSalesmen = async () => {
  db.query.salesman.findMany({
    with: {
      person: true
    }
  })
}

export type Accounts = AsyncReturnType<typeof getAllAccounts>;
export type AccountWithPerson = AsyncReturnType<typeof getAccountWithPerson>;
