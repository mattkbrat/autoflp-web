import type { AsyncReturnType } from "~/types/utility";
import { db } from "../..";
import type { Person } from "../account/get";

const personSelect: Partial<{ [key in keyof Person]: true }> = {
  firstName: true,
  lastName: true,

}

export const getDetailedDeal = async (query: string) => {
  return db.query.deal.findFirst({
    where: ({ id }, { eq }) =>
      eq(id, query),
    columns: {
      finance: true,
      lien: true,
      date: true,
      apr: true,
      pmt: true,
      term: true,
      state: true,
    },
    with: {
      account: {
        columns: {},
        with: {
          person: {
            columns: personSelect
          },
        },
      },
      payments: {
        columns: {
          id: true,
          date: true,
          amount: true,
        }
      },
      inventory: {
        columns: {
          id: true,
          vin: true,
          year: true,
          make: true,
        },
        with: {
          inventorySalesmen: {
            columns: {},
            with: {
              salesman: {
                columns: {},
                with: {
                  person: {
                    columns: personSelect,
                  },
                },
              },
            },
          },
        },
      },
      creditor: {
        columns: {
          businessName: true,
        },
      },
      dealCharges: {
        with: {
          charge: true,
        },
      },
      dealTrades: {
        with: {
          inventory: true
        },
        columns: {
          value: true,
          vin: true,
        },
      },
    },
  });
};

export type DetailedDeal = AsyncReturnType<typeof getDetailedDeal>;
