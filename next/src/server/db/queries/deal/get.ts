import { db } from "../.."

export type SalemanPaymentsGroupBy = {
  month?: boolean;
  year?: boolean;
  quarter?: boolean;
  salesman?: boolean;
};

export const getAccountDeals = async (accountId: string) => {
  return db.query.deal.findMany({
    where: ({ account }, { eq }) => {
      return eq(account, accountId)
    },
    orderBy({ date, state }, { desc }) {
      return [
        desc(state),
        desc(date)
      ]
    },
    with: {
      inventory: {
        columns: {
          year: true,
          make: true
        }
      }
    }
  })
}


