import fs from "node:fs";
import path from "node:path";
import { downloadFromBucket } from "$lib/server/s3";
import { bucketPaths, type GenerateFormParams } from ".";
import { PDFDocument } from "pdf-lib";
import { checkDocsDir } from "./checkDocsDir";
import { randomUUID } from "node:crypto";
import { dev } from "$app/environment";

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
	const outputName = output || `${withoutFilename}_${randomUUID()}.pdf`;

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

	const pdfForm = pdfDoc.getForm();

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

	for (const field of fields) {
		if (field.isReadOnly()) continue;
		const name = field.getName();
		try {
			const formField = pdfForm.getTextField(name);
			const data = dataObj[name];
			if (data) {
				console.log("filling", name, data);
			}
			if (!data) {
				console.warn("No data provided for field", name);
				formField.setText("");
				continue;
			}
			formField.setText(data.toUpperCase());
		} catch (e) {
			try {
				const radioGroup = pdfForm.getRadioGroup(name);
				const data = dataObj[name];
				if (data) {
					radioGroup.select(data.toString());
				}
				if (!data) {
					console.warn("No data provided for field", name);
					radioGroup.select("0");
					continue;
				}
			} catch (e2) {
				console.error(
					"Caught error filling form field",
					{ name, value: dataObj[name] },
					e,
				);
				console.error("(Radio)", e2);
			}
		}
	}

	for await (const { mimeType, path, title } of attachments) {
		const content = fs.readFileSync(path);

		await pdfDoc.attach(content, title, {
			mimeType,
		});
	}

	const bytes = await pdfDoc.save();

	// Write to file

	fs.writeFileSync(outputPath, bytes);
	return {
		output: bytes,
	};
};
