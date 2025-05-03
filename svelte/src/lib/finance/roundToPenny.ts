/**
 * @description Take an unisgned integer and round it to the nearest penny
 * @example 50.0005 --> 50.01
 * @example  50.0004 --> 50.00
 **/
export const roundToPenny = (num: number) => {
	return Math.round(num * 100.0) / 100.0;
};
