import { AUTOFLP_DATA_DIR } from "$env/static/private";
import { error, fail, type RequestHandler } from "@sveltejs/kit";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import AdmZip from "adm-zip";

export const GET: RequestHandler = ({ url }) => {
	const params = url.searchParams;
	const file = params.get("file");
	console.log({ file }, params.keys());

	const isArray = Array.isArray(file);
	const files = (isArray ? file : [file]).reduce(
		(acc, file) => {
			if (!file || typeof file !== "string") return false;
			const fullPath = join(AUTOFLP_DATA_DIR, file);
			console.log({ fullPath });
			if (!existsSync(fullPath)) return acc;
			acc.push({ fileName: file, fullPath });
			return acc;
		},
		[] as { fileName: string; fullPath: string }[],
	);
	if (!Array.isArray(files) || files.length <= 0) {
		return new Response(
			JSON.stringify(
				{
					message:
						"Must provide a query of at least one file under with the query param 'file'",
				},
				null,
				2,
			),
			{ status: 400, headers: { "CONTENT-TYPE": "application/json" } },
		);
	}

	const zip = new AdmZip();

	console.log(files);

	for (const { fullPath } of files) {
		zip.addLocalFile(fullPath);
	}

	const zipped = zip.toBuffer();
	return new Response(zipped, { status: 200, headers: {} });
};
