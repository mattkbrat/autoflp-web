import fs from "node:fs";
import path from "node:path";
import type { CheckDocsDirParams } from ".";
import { AUTOFLP_DATA_DIR } from "..";

const fileNameRegex = /(.*?)\.(jpg|gif|doc|pdf)$/;
/**
 * Checks that the app's documents directory exists.
 */

export const checkDocsDir = ({
	createIfNotExists = true,
	checkPath = "documents",
}: CheckDocsDirParams = {}) => {
	const isFullPath = fileNameRegex.test(checkPath);

	const withoutFilename = isFullPath
		? checkPath.split("/").slice(0, -1).join("/")
		: checkPath;

	const dir = path.join(
		AUTOFLP_DATA_DIR,
		withoutFilename.replaceAll(AUTOFLP_DATA_DIR, ""),
	);
	const doesExist = fs.existsSync(dir);
	if (doesExist || !createIfNotExists) return doesExist ? dir : null;
	fs.mkdirSync(dir, { recursive: true });
	return dir;
};
