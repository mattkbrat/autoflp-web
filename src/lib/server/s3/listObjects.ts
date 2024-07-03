import { s3Client } from ".";

import { ListObjectsCommand } from "@aws-sdk/client-s3";

export const listObjects = async (bucketName: string, prefix: string) => {
	const command = new ListObjectsCommand({
		Bucket: bucketName,
		Prefix: prefix,
	});

	const result = await s3Client.send(command);

	return result.Contents;
};
