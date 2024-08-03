import {
	DeleteObjectCommand,
	type DeleteObjectCommandInput,
} from "@aws-sdk/client-s3";
import { s3Client } from ".";

export const deleteFromBucket = async (
	bucketName: string,
	fileName?: string,
) => {
	let filesToDelete = [fileName];
	let deletedFiles: string[] = [];

	const input: DeleteObjectCommandInput = {
		Bucket: bucketName,
		Key: fileName,
	};

	console.log("Trying to delete", input);
	for (const file of filesToDelete) {
		if (!file) continue;
		const removeCommand = new DeleteObjectCommand(input);

		const result = await s3Client.send(removeCommand);

		if (
			!result.DeleteMarker &&
			result.$metadata.httpStatusCode &&
			result.$metadata.httpStatusCode > 300
		) {
			console.warn("Failed to remove file", file, result.$metadata);
			continue;
		}

		deletedFiles.push(file);
	}

	console.log("Deleted", deletedFiles);

	return deletedFiles;
};
