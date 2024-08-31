import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from ".";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const getPresignedUrl = async (bucketName: string, key: string) => {
	const command = new GetObjectCommand({
		Bucket: bucketName,
		Key: key,
	});

	return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
