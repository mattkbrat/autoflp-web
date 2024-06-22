import {
	AWS_ACCESS_KEY_ID,
	AWS_SECRET_ACCESS_KEY,
	ENDPOINT,
} from "$env/static/private";
import { S3Client as Client } from "@aws-sdk/client-s3";
export const s3Client = new Client({
	region: "auto",
	endpoint: ENDPOINT,
	credentials: {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY,
	},
});
