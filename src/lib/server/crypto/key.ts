import { ENCRYPT_KEY } from "$env/static/private";

const get32BytesBuffer = (key: string) => {
	return Buffer.concat([Buffer.from(key), Buffer.alloc(32)], 32);
};

export const key = get32BytesBuffer(ENCRYPT_KEY);
