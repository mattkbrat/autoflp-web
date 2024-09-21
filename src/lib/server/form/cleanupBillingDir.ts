import { join } from "node:path";
import { AUTOFLP_DATA_DIR } from "..";
import { existsSync, lstatSync, readdir, rmSync } from "node:fs";

export const cleanup = () => {
	const billingDirectory = join(AUTOFLP_DATA_DIR, "documents", "billing");
	if (existsSync(billingDirectory)) {
		readdir(billingDirectory, (err, files) => {
			if (err) {
				console.error("Error reading directory", err);
			} else {
				if (files.length > 1) {
					console.log("Clearing existing bills from", billingDirectory);
				}
				for (const file of files) {
					const fullpath = join(billingDirectory, file);
					if (!fullpath.endsWith("pdf")) {
						console.warn("Not a pdf", fullpath);
						continue;
					}
					const stat = lstatSync(fullpath);
					if (stat.isDirectory()) {
						console.warn("Path is directory, not deleting", fullpath);
						continue;
					}

					if (!stat.isFile()) {
						console.warn("Path is not a file", fullpath);
						continue;
					}

					console.warn("deleting", fullpath);
					rmSync(fullpath);
				}
			}
		});
	}
};