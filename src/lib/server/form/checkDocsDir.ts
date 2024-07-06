import fs from "node:fs";
import path from "node:path";

import { homeDir, type CheckDocsDirParams } from ".";

/**
 * Checks that the app's documents directory exists.
 */

export const checkDocsDir = ({
	createIfNotExists = true,
	checkPath = "documents",
}: CheckDocsDirParams = {}) => {
	const expectedPath = path.join(homeDir, "/.autoflp", `/${checkPath}`);
	const doesExist = fs.existsSync(expectedPath);
	if (doesExist || !createIfNotExists) return doesExist ? expectedPath : null;
	fs.mkdirSync(expectedPath, { recursive: true });
	return expectedPath;
};
