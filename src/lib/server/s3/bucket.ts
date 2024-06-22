import { CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { s3Client } from ".";

const getBucketFilterInput = (bucket: string) => {
	return {
		Bucket: bucket,
	};
};

export const bucketExists = async (name: string) => {
	const input = getBucketFilterInput(name);

	const headBucketCommand = new HeadBucketCommand(input);
	return s3Client
		.send(headBucketCommand)
		.catch((e) => {
			if ("name" in e && typeof e.name === "string") {
				const isNotFoundError = e.name.startsWith("NotFound");
				if (isNotFoundError) return false;
				console.log("Found error heading bucket", e?.message);
			}
			console.log("Found unexpected error heading bucket", e);
			return false;
		})
		.then((result) => {
			console.debug("got result", { result });
			if (typeof result === "boolean") return result;
			return !!result.BucketRegion;
		});
};

export const createBucket = async (name: string) => {
	const input = getBucketFilterInput(name);

	const createBucketCommand = new CreateBucketCommand(input);
	const createBucketResult = await s3Client.send(createBucketCommand);

	if (!createBucketResult.Location) {
		return new Error(`Failed to create bucket by name: ${name}`);
	}
};

export const createBucketIfNotExists = async (name: string) => {
	return bucketExists(name).then(async (exists) => {
		if (exists) return;
		return createBucket(name);
	});
};
