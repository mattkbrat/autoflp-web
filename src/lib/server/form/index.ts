import type { StringObj } from "$lib/types";
import type { Form } from "$lib/types/forms";
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
	form: Form;
	output?: string;
	data: string[] | Partial<StringObj>;
	id?: string;
	concat?: {
		concat: true;
		lookup: string;
		final: boolean;
	};
	attachments: Attachments;
	returnType?: "bytes" | "pdf";
};

export const bucketPaths = {
	filled: "filled",
	templates: "forms",
};
