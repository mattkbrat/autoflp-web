// biome-ignore lint/suspicious/noExplicitAny: We need to allow any argument here
export type AsyncReturnType<T extends (...args: any[]) => any> = Awaited<
	ReturnType<T>
>;
