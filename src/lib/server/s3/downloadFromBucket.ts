import { GetObjectCommand } from "@aws-sdk/client-s3";
import { createBucketIfNotExists } from "./bucket";
import { s3Client } from "./s3Client";
import fs from "node:fs";
import path from "node:path";

import { AUTOFLP_DATA_DIR } from "$env/static/private";

export const downloadFromBucket = async ({
	bucket,
	key,
	createBucketIfNotExists: handleCreate = true,
	filename,
	directory = ".",
}: {
	bucket: string;
	key: string;
	createBucketIfNotExists?: boolean;
	filename: string;
	directory?: string;
}) => {
	const outputFile = path.join(AUTOFLP_DATA_DIR, directory, filename);
	console.debug(`Download ${filename} from s3 store to ${outputFile}`);
	if (handleCreate) {
		await createBucketIfNotExists(bucket);
	}

	const command = new GetObjectCommand({
		Bucket: bucket,
		Key: key,
	});

	const object = await s3Client.send(command).catch((e) => {
		console.error(e.name, e.message);
	});

	if (!object || !object.Body) return null;

	const readStream = object.Body;

	const byteArr = await readStream?.transformToByteArray();

	fs.writeFileSync(outputFile, byteArr);

	return outputFile;
};
