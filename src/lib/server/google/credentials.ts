import { randomUUID } from "node:crypto";
import { mkdtemp, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as localAuth from "@google-cloud/local-auth";
import { google } from "googleapis";
import type { AuthPlus } from "googleapis/build/src/googleapis";
import { SCOPES } from ".";
import { createKey, getKeyValue } from "../database/keys";

/**
 * Reads previously authorized credentials from the save file.
 */
async function loadSavedCredentialsIfExist(business: string) {
	try {
		const content = await getKeyValue({
			type: "keyBusiness",
			key: "google-token",
			business,
		});
		if (!content || !content.value) return null;
		const credentials = JSON.parse(content.value);
		return google.auth.fromJSON(credentials);
	} catch {
		return null;
	}
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 * @param {OAuth2Client} client
 */
async function saveCredentials(client: unknown, business: string) {
	const content = await getKeyValue({
		type: "keyBusiness",
		key: "google-creds",
		business,
	});
	const keys = JSON.parse(content as unknown as string);
	const key = keys.installed || keys.web;
	const payload = JSON.stringify({
		type: "authorized_user",
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token,
	});

	await createKey({ business, key: "google-creds", value: payload });
}

/**
 * Load or request or authorization to call APIs.
 *
 */
export async function authorize(business: string) {
	let client = await loadSavedCredentialsIfExist(business);
	if (client) {
		return client;
	}
	const dir: string | Error = await new Promise((resolve, reject) => {
		const dir = join(tmpdir(), `google-api-${business}-`);
		mkdtemp(dir, async (err, directory) => {
			if (err) return reject(err.message);
			return resolve(directory);
		});
	});

	if (dir instanceof Error) {
		throw dir;
	}

	const filename = join(dir, `${business}-google-api-key.json`);
	const creds = await getKeyValue({
		type: "keyBusiness",
		key: "google-creds",
		business,
	});
	if (!creds?.value) {
		throw new Error(
			"Must set google creds in database before running auth function",
		);
	}
	writeFileSync(filename, creds.value);

	client = await localAuth.authenticate({
		scopes: SCOPES,
		keyfilePath: filename,
	});

	if (client.credentials) {
		await saveCredentials(client, business);
	}
	return client;
}
