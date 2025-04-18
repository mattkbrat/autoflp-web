import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../..";
import { account } from "../../schema";

export const deleteAccountSchema = z.object({
	id: z.string(),
});

export type DeleteAccount = z.infer<typeof deleteAccountSchema>;

export const deleteAccount = async (o: DeleteAccount) =>
	db.delete(account).where(eq(account.id, o.id));
