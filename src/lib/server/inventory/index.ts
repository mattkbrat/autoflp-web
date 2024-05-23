import { handleFetch, parseNHTSA } from "./fetchNHTSA";

export { handleFetch, parseNHTSA };

export type ParsedNHTA = ReturnType<typeof parseNHTSA>;
