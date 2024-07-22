import fs from "node:fs";
import path, { join } from "node:path";
import { downloadFromBucket } from "$lib/server/s3";
import { bucketPaths, type GenerateFormParams } from ".";
import { PDFDocument } from "pdf-lib";
import { checkDocsDir } from "./checkDocsDir";
import { randomUUID } from "node:crypto";
import { dev } from "$app/environment";
import { AUTOFLP_DATA_DIR } from "$env/static/private";

export const generate = async ({
	form,
	output,
	data,
	concat,
	attachments,
}: GenerateFormParams) => {
	const dataObj: {
		[key: string]: string;
	} = !Array.isArray(data) ? data : {};

	const withoutFilename = form.split(".pdf")[0];
	const pdfFormName = `${withoutFilename}.pdf`;
	const outputName = join(
		output || ".",
		`${withoutFilename}_${randomUUID().split("-").slice(-1)}.pdf`,
	);

	if (Array.isArray(data)) {
		data.map((item, index) => {
			dataObj[`${index}`] = `${item}`;
		});
	}

	const isArrayOfArrays = (data: any) => {
		return Array.isArray(data) && data.every(Array.isArray);
	};

	if (isArrayOfArrays(data)) {
		const thisData = data as unknown as string[][];
		thisData
			.map((item, index) => {
				if (!output) return;
				concat = {
					concat: true,
					lookup: output,
					final: index === thisData.length - 1,
				};

				return generate({
					form,
					output,
					data: item,
					concat,
					attachments: [],
				});
			})
			.filter(Boolean);
	}

	const formsDirectory = checkDocsDir({
		createIfNotExists: true,
		checkPath: "forms",
	});
	const docsDirectory = checkDocsDir({ createIfNotExists: true });
	const mappedDir = checkDocsDir({
		createIfNotExists: true,
		checkPath: "mapped",
	});

	if (!formsDirectory || !docsDirectory || !mappedDir) {
		throw new Error("Could not get the forms directory");
	}

	const inputPath = path.join(formsDirectory, pdfFormName);
	const outputPath = path.join(docsDirectory, outputName);
	const mappedPath = path.join(mappedDir, `${withoutFilename}.json`);
	console.log({ inputPath });
	// const outputPath = outputFullPath(output);

	if (!fs.existsSync(inputPath)) {
		// Download from s3 client
		throw new Error(`Form at path does not exists: ${inputPath}`);
		await downloadFromBucket({
			bucket: bucketPaths.templates,
			key: pdfFormName,
			filename: pdfFormName,
			directory: formsDirectory,
		});
	}

	// Check again, and throw error if no form found
	if (!fs.existsSync(inputPath)) {
		throw new Error(`No form found by name ${form}.pdf`);
	}

	console.log("Writing", outputPath, "from template", inputPath);

	const pdfDoc = await PDFDocument.load(fs.readFileSync(inputPath));

	const f = pdfDoc.getForm();
	const fields = f.getFields();

	if (dev && !fs.existsSync(mappedPath)) {
		const mapped = fields.reduce(
			(acc, f, i) => {
				const name = f.getName();
				acc[name] = "";
				return acc;
			},
			{} as { [key: string]: string },
		);

		fs.writeFileSync(mappedPath, JSON.stringify(mapped, null, 2));
	}

	const fillField = (
		key: string,
		value: string,
		type: "Text" | "Radio" | "Checkbox",
	) => {
		try {
			if (type === "Text") {
				const formField = f.getTextField(key);
				formField.setText(value?.toUpperCase() || "");
				//formField.setText(value?.toUpperCase() || dev ? key : "");
			} else if (type === "Radio") {
				const formField = f.getRadioGroup(key);
				formField.select(value || "");
			} else if (type === "Checkbox" && value) {
				const formField = f.getCheckBox(key);
				console.log("Checking checkbox", key);
				formField.check();
			}
			return true;
		} catch (e) {
			return `${key}:${type}: ${e.message}`;
		}
	};

	fieldLoop: for (const field of fields) {
		let errors: string[] = [];
		if (field.isReadOnly()) continue;
		const name = field.getName();
		const data = dataObj[name];
		for (const k of ["Text", "Radio", "Checkbox"] as const) {
			const fillResult = fillField(name, data, k);
			if (fillResult === true) continue fieldLoop;
			errors.push(fillResult);
		}
		console.warn("Failed to fill field");
		console.info(errors.join("\n"));
	}

	for await (const { mimeType, path, title } of attachments) {
		const content = fs.readFileSync(path);

		await pdfDoc.attach(content, title, {
			mimeType,
		});
	}

	const bytes = await pdfDoc.save();

	// Write to file
	//

	checkDocsDir({
		createIfNotExists: true,
		checkPath: outputPath,
	});

	fs.writeFileSync(outputPath, bytes);
	return {
		output: bytes,
	};
};
