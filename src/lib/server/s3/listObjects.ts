import { s3Client } from ".";

import { ListObjectsCommand } from "@aws-sdk/client-s3";

export const listObjects = async (bucketName: string, prefix: string) => {
	console.log("listing", { bucketName, prefix });
	const command = new ListObjectsCommand({
		Bucket: bucketName,
		Prefix: prefix,
	});

	// Cloudflare returns all objects, regardless of prefix.
	const result = await s3Client.send(command);

	const { Contents } = result;

	if (!prefix) return Contents || [];

	return Contents?.filter((obj) => obj.Key?.startsWith(`${prefix}/`)) || [];
};
