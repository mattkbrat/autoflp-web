import { env } from "$env/dynamic/private";

export const keys = {
	default: env.ENCRYPT_KEY,
	credit: env.CREDIT_ENCRYPT_KEY,
};
