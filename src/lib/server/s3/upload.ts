import { s3Client } from ".";
import {
	PutObjectCommand,
	type PutObjectCommandInput,
} from "@aws-sdk/client-s3";

const bucketName = "filled";
import fs from "node:fs";
import { createBucketIfNotExists } from "./bucket";

export const upload = async ({
	bucket = bucketName,
	filename,
	file,
}: {
	bucket?: string;
	filename: string;
	file: string | Buffer | Uint8Array;
}) => {
	file = typeof file === "string" ? fs.readFileSync(file) : file;

	await createBucketIfNotExists(bucket);

	const putObjectInput: PutObjectCommandInput = {
		Body: file,
		Bucket: bucket,
		Key: filename,
		ContentDisposition: `inline; filename="${filename}"`,
	};

	const command = new PutObjectCommand(putObjectInput);

	return await s3Client.send(command);
};
