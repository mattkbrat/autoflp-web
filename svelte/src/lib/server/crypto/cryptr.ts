import Cryptr from "cryptr";
import { keys } from "./key";

export const cryptr = new Cryptr(keys.default);

export const cryptrCredit = new Cryptr(keys.credit);
