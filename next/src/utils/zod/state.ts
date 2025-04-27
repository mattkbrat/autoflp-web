import { z } from "zod";

export const state = z.literal(0).or(z.literal(1)).or(z.null());

export type State = z.infer<typeof state>;
