import { s3Client } from ".";
import {
	CreateBucketCommand,
	HeadBucketCommand,
	PutObjectCommand,
	type PutObjectCommandInput,
} from "@aws-sdk/client-s3";

const bucketName = "filled";
import fs from "node:fs";

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

	// check that the bucket exists
	const input = {
		Bucket: bucket,
	};

	const headBucketCommand = new HeadBucketCommand(input);
	const headBucketResult = await s3Client.send(headBucketCommand);

	if (!headBucketResult.BucketRegion) {
		const createBucketCommand = new CreateBucketCommand(input);
		const createBucketResult = await s3Client.send(createBucketCommand);

		if (!createBucketResult.Location) {
			return new Error("Failed to create the bucket " + bucket);
		}
	}

	const putObjectInput: PutObjectCommandInput = {
		Body: file,
		Bucket: bucket,
		Key: filename,
		ContentDisposition: 'inline; filename="' + filename + '"',
	};

	const command = new PutObjectCommand(putObjectInput);

	return await s3Client.send(command);
};
