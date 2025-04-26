import { handleFetch, parseNHTSA } from "./nhtsa";

export { handleFetch, parseNHTSA };

export type ParsedNHTA = ReturnType<typeof parseNHTSA>;
