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
	contentType,
}: {
	bucket?: string;
	filename: string;
	file: PutObjectCommandInput["Body"];
	contentType?: PutObjectCommandInput["ContentType"];
}) => {
	file = typeof file === "string" ? fs.readFileSync(file) : file;

	await createBucketIfNotExists(bucket);

	const putObjectInput: PutObjectCommandInput = {
		Body: file,
		Bucket: bucket,
		Key: filename,
		ContentDisposition: `inline; filename="${filename}"`,
		ContentType: contentType,
	};

	const command = new PutObjectCommand(putObjectInput);

	return await s3Client.send(command);
};
