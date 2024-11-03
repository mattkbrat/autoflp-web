// Adapter from https://github.com/cfpb/amortize/blob/master/test/test.js

import { assert, describe, expect, it } from "vitest";
import { amortize } from "./amortize";

const testVal = amortize({
	amount: 180000,
	rate: 4.25,
	totalTerm: 360,
	amortizeTerm: 60,
});
const testVal2 = amortize({
	amount: 180000,
	rate: 4.375,
	totalTerm: 360,
	amortizeTerm: 60,
});
const testVal3 = amortize({
	amount: 0,
	rate: 4.375,
	totalTerm: 360,
	amortizeTerm: 60,
});
const testVal4 = amortize({
	amount: 180000,
	rate: 0,
	totalTerm: 360,
	amortizeTerm: 60,
});
const testVal5 = amortize({
	amount: 180000,
	rate: 4.25,
	totalTerm: 360,
	amortizeTerm: 360,
	principalPayment: 0,
});
const testVal6 = amortize({
	amount: 180000,
	rate: 4.25,
	totalTerm: 360,
	amortizeTerm: 360,
	principalPayment: 200,
});

const testVal7 = amortize({
	amount: 180000,
	rate: 4.25,
	totalTerm: 360,
	amortizeTerm: 60,
	repaymentType: "equal-principal-payment",
});
const testVal8 = amortize({
	amount: 180000,
	rate: 4.375,
	totalTerm: 360,
	amortizeTerm: 60,
	repaymentType: "equal-principal-payment",
});
const testVal9 = amortize({
	amount: 0,
	rate: 4.375,
	totalTerm: 360,
	amortizeTerm: 60,
	repaymentType: "equal-principal-payment",
});
const testVal10 = amortize({
	amount: 180000,
	rate: 0,
	totalTerm: 360,
	amortizeTerm: 60,
	repaymentType: "equal-principal-payment",
});
const testVal11 = amortize({
	amount: 180000,
	rate: 4.25,
	totalTerm: 360,
	amortizeTerm: 360,
	principalPayment: 0,
	repaymentType: "equal-principal-payment",
});
const testVal12 = amortize({
	amount: 180000,
	rate: 4.25,
	totalTerm: 360,
	amortizeTerm: 360,
	principalPayment: 200,
	repaymentType: "equal-principal-payment",
});

const testVal13 = amortize({
	amount: 180000,
	rate: 4.25,
	totalTerm: 360,
	amortizeTerm: 60,
	partialMonthOffset: 0.5,
});
const testVal14 = amortize({
	amount: 180000,
	rate: 4.375,
	totalTerm: 360,
	amortizeTerm: 60,
	partialMonthOffset: 0.5,
});
const testVal15 = amortize({
	amount: 0,
	rate: 4.375,
	totalTerm: 360,
	amortizeTerm: 60,
	partialMonthOffset: 0.5,
});
const testVal16 = amortize({
	amount: 180000,
	rate: 0,
	totalTerm: 360,
	amortizeTerm: 60,
	partialMonthOffset: 0.5,
});
const testVal17 = amortize({
	amount: 180000,
	rate: 4.25,
	totalTerm: 360,
	amortizeTerm: 360,
	principalPayment: 0,
	partialMonthOffset: 0.5,
});
const testVal18 = amortize({
	amount: 180000,
	rate: 4.25,
	totalTerm: 360,
	amortizeTerm: 360,
	principalPayment: 200,
	partialMonthOffset: 0.5,
});

const testVal19 = amortize({
	amount: 180000,
	rate: 4.25,
	totalTerm: 360,
	amortizeTerm: 60,
	repaymentType: "equal-principal-payment",
	partialMonthOffset: 0.5,
});
const testVal20 = amortize({
	amount: 180000,
	rate: 4.375,
	totalTerm: 360,
	amortizeTerm: 60,
	repaymentType: "equal-principal-payment",
	partialMonthOffset: 0.5,
});
const testVal21 = amortize({
	amount: 0,
	rate: 4.375,
	totalTerm: 360,
	amortizeTerm: 60,
	repaymentType: "equal-principal-payment",
	partialMonthOffset: 0.5,
});
const testVal22 = amortize({
	amount: 180000,
	rate: 0,
	totalTerm: 360,
	amortizeTerm: 60,
	repaymentType: "equal-principal-payment",
	partialMonthOffset: 0.5,
});
const testVal23 = amortize({
	amount: 180000,
	rate: 4.25,
	totalTerm: 360,
	amortizeTerm: 360,
	principalPayment: 0,
	repaymentType: "equal-principal-payment",
	partialMonthOffset: 0.5,
});
const testVal24 = amortize({
	amount: 180000,
	rate: 4.25,
	totalTerm: 360,
	amortizeTerm: 360,
	principalPayment: 200,
	repaymentType: "equal-principal-payment",
	partialMonthOffset: 0.5,
});

// Amortize

describe("Can test multiple amortization scenarios", () => {
	assert(!("error" in testVal), "Failed to calculate");
	it("After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate will have paid $36583.362108097754 in raw interest", () => {
		expect(testVal.interest).toBeCloseTo(36583.362108097754);
	});
	it("After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate will have paid $36,583.36 in interest", () => {
		expect(testVal.interestRound).toEqual((36583.36).toFixed(2));
	});
	it("After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate will have paid $16,546.15 in principal", () => {
		expect(testVal.principalRound).toEqual((16546.15).toFixed(2));
	});
	it("After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate will owe $163,453.85", () => {
		expect(testVal.balanceRound).toEqual((163453.85).toFixed(2));
	});
	it("A borrower with a 30 year, $180,000 loan with a 4.25% interest rate will pay $885.49 monthly", () => {
		expect(testVal.paymentRound).toEqual((885.49).toFixed(2));
	});
});

describe("total interest", () => {
	assert(!("error" in testVal2), "Failed to calculate");
	it("After 5 years a borrower with a 30 year, $180,000 loan with a 4.375% interest rate will have paid $37,694.10 in interest", () => {
		expect(testVal2.interestRound).toEqual((37694.1).toFixed(2));
	});
});

describe("extra payments", () => {
	assert(!("error" in testVal23), "Failed to calculate");
	assert(!("error" in testVal6), "Failed to calculate");
	it("After 30 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and equal principal payment and partial month offset of 0.5 paying $200 extra per month will have saved $23,338.00 in interest", () => {
		expect(
			(
				Number(testVal23.interestRound) - Number(testVal6.interestRound)
			).toFixed(2),
		).toEqual((23338.0).toFixed(2));
	});

	assert(!("error" in testVal5), "Failed to calculate");
	it("After 30 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate paying $200 extra per month will have saved $47,047.19 in interest", () => {
		expect(
			(Number(testVal5.interestRound) - Number(testVal6.interestRound)).toFixed(
				2,
			),
		).toEqual((47047.19).toFixed(2));
	});

	// exports[
	//
	// ] = function (test) {
	//   test.done();
	// };
	//
	// exports[
	//   "After 30 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate paying $200 extra per month will have saved 109 Months"
	// ] = function (test) {
	//   test.equal(testVal6.termsSaved, 109);
	//   test.done();
	// };
	//
	// exports[
	//   "After 30 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate paying $200 extra per month will start paying more in principal after 56 months"
	// ] = function (test) {
	//   test.equal(testVal6.principalBreakingTerm, 56);
	//   test.done();
	// };
});

describe("offset", () => {
	assert(!("error" in testVal21), "Failed to calculate");
	it("After 5 years a borrower borrowing nothing with equal principal payment and partial month offset of 0.5 will owe no interest", () => {
		expect(testVal21.interestRound).toEqual((0.0).toFixed(2));
	});

	assert(!("error" in testVal22), "Failed to calculate");

	it("After 5 years a borrower borrowing without interest and equal principal payment and partial month offset of 0.5 will owe no interest", () => {
		expect(testVal22.interestRound).toEqual((0.0).toFixed(2));
	});

	// exports[
	//
	// ] = function (test) {
	// };
});

describe("fail states", () => {
	it.fails("Throw an error if bad repaymentType is passed", () => {
		amortize({
			amount: 180000,
			rate: 4.25,
			totalTerm: 360,
			amortizeTerm: 60,
			repaymentType: "banana",
		});
		expect(true).toBeTruthy();
	});

	it.fails("Throw an error if a string is passed for amount", () => {
		amortize({
			amount: "Gregor Samsa" as unknown as number,
			rate: 4.25,
			totalTerm: 360,
			amortizeTerm: 60,
		});
		expect(true).toBeTruthy();
	});

	it.fails("Throw an error if a negaive value is passed for amount", () => {
		amortize({
			amount: -180000,
			rate: 4.25,
			totalTerm: 360,
			amortizeTerm: 60,
		});
		expect(true).toBeTruthy();
	});
});

// exports[
//
// ] = function (test) {
//   test.done();
// };
//
// exports["After 5 years a borrower borrowing nothing will owe no interest"] =
//   function (test) {
//     test.equal(testVal3.interestRound, 0);
//     test.done();
//   };
//
// exports[
//   "After 5 years a borrower borrowing without interest will owe no interest"
// ] = function (test) {
//   test.equal(testVal4.interestRound, 0);
//   test.done();
// };
//
//
// // equal principal payment
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and equal principal payments will have paid $35115.625 in raw interest"
// ] = function (test) {
//   test.equal(testVal7.interest, 35115.625);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and equal principal payments will have paid $35,115.63 in interest"
// ] = function (test) {
//   test.equal(testVal7.interestRound, 35115.63);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and equal principal payments will have paid $30,000.00 in principal"
// ] = function (test) {
//   test.equal(testVal7.principalRound, 30000.0);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and equal principal payments will owe $150,000.00"
// ] = function (test) {
//   test.equal(testVal7.balanceRound, 150000.0);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.375% interest rate and equal principal payments will have paid $36,148.44 in interest"
// ] = function (test) {
//   test.equal(testVal8.interestRound, 36148.44);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower borrowing nothing with equal principal payments will owe no interest"
// ] = function (test) {
//   test.equal(testVal9.interestRound, 0);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower borrowing without interest and equal principal payments will owe no interest"
// ] = function (test) {
//   test.equal(testVal10.interestRound, 0);
//   test.done();
// };
//
// exports[
//   "After 30 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and equal principal payments paying $200 extra per month will have saved $23,338.89 in interest"
// ] = function (test) {
//   test.equal(
//     (testVal11.interestRound - testVal6.interestRound).toFixed(2),
//     23338.89,
//   );
//   test.done();
// };
//
// exports[
//   "After 30 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and equal principal payments paying $200 extra per month will have saved 102 Months"
// ] = function (test) {
//   test.equal(testVal12.termsSaved, 102);
//   test.done();
// };
//
// // amortize with partial month offset
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and partial month offset of 0.5 will have paid $36293.37156663184 in raw interest"
// ] = function (test) {
//   test.equal(testVal13.interest, 36293.37156663184);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and partial month offset of 0.5 will have paid $36,293.37 in interest"
// ] = function (test) {
//   test.equal(testVal13.interestRound, 36293.37);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and partial month offset of 0.5 will have paid $16,393.39 in principal"
// ] = function (test) {
//   test.equal(testVal13.principalRound, 16393.39);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and partial month offset of 0.5 will owe $163,606.61"
// ] = function (test) {
//   test.equal(testVal13.balanceRound, 163606.61);
//   test.done();
// };
//
// exports[
//   "A borrower with a 30 year, $180,000 loan with a 4.25% interest rate and partial month offset of 0.5 will pay $885.49 monthly after the first month and not including the last month"
// ] = function (test) {
//   test.equal(testVal13.paymentRound, 885.49);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.375% interest rate and partial month offset of 0.5 will have paid $37,395.01 in interest"
// ] = function (test) {
//   test.equal(testVal14.interestRound, 37395.01);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower borrowing nothing with partial month offset of 0.5 will owe no interest"
// ] = function (test) {
//   test.equal(testVal15.interestRound, 0);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower borrowing without interest and partial month offset of 0.5 will owe no interest"
// ] = function (test) {
//   test.equal(testVal16.interestRound, 0);
//   test.done();
// };
//
// exports[
//   "After 30 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and partial month offset of 0.5 paying $200 extra per month will have saved $47,045.63 in interest"
// ] = function (test) {
//   test.equal(
//     (testVal17.interestRound - testVal6.interestRound).toFixed(2),
//     47045.63,
//   );
//   test.done();
// };
//
// exports[
//   "After 30 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and partial month offset of 0.5 paying $200 extra per month will have saved 109 Months"
// ] = function (test) {
//   test.equal(testVal18.termsSaved, 109);
//   test.done();
// };
//
// // equal principal payment with partial month offset
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and equal principal payment and partial month offset of 0.5 will have paid $34,849.11458333333 in raw interest"
// ] = function (test) {
//   test.equal(testVal19.interest, 34849.11458333333);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and equal principal payment and partial month offset of 0.5 will have paid $34,849.11 in interest"
// ] = function (test) {
//   test.equal(testVal19.interestRound, 34849.11);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and equal principal payment and partial month offset of 0.5 will have paid $29,750.00 in principal"
// ] = function (test) {
//   test.equal(testVal19.principalRound, 29750.0);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and equal principal payment and partial month offset of 0.5 will owe $150,250.00"
// ] = function (test) {
//   test.equal(testVal19.balanceRound, 150250.0);
//   test.done();
// };
//
// exports[
//   "After 5 years a borrower with a 30 year, $180,000 loan with a 4.375% interest rate and equal principal payment and partial month offset of 0.5 will have paid $35,874.09 in interest"
// ] = function (test) {
//   test.equal(testVal20.interestRound, 35874.09);
//   test.done();
// };
//
//
//
// exports[
//   "After 30 years a borrower with a 30 year, $180,000 loan with a 4.25% interest rate and equal principal payment and partial month offset of 0.5 paying $200 extra per month will have saved 102 Months"
// ] = function (test) {
//   test.equal(testVal24.termsSaved, 102);
//   test.done();
// };
//
//
