import type { StringObj } from "$lib/types";
import os from "node:os";
export const homeDir = os.homedir();

export type Attachments = {
	mimeType: string;
	title: string;
	path: string;
}[];

export type CheckDocsDirParams = {
	createIfNotExists?: boolean;
	checkPath?: string;
};

export type GenerateFormParams = {
	form: string;
	output?: string;
	data: string[] | StringObj;
	concat?: {
		concat: true;
		lookup: string;
		final: boolean;
	};
	attachments: Attachments;
};

export const bucketPaths = {
	filled: "filled",
	templates: "forms",
};
