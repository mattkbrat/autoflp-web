import fs from "node:fs";
import path from "node:path";
import { downloadFromBucket } from "$lib/server/s3";
import { bucketPaths, type GenerateFormParams } from ".";
import { PDFDocument } from "pdf-lib";
import { checkDocsDir } from "./checkDocsDir";
import { randomUUID } from "node:crypto";

export const generate = async ({
	form,
	output,
	data,
	concat,
	attachments,
}: GenerateFormParams) => {
	const dataObj: {
		[key: string]: string;
	} = {};

	const withoutFilename = form.split(".pdf")[0];
	const pdfFormName = `${withoutFilename}.pdf`;
	const outputName = output || `${withoutFilename}_${randomUUID()}.pdf`;

	data.map((item, index) => {
		dataObj[`${index}`] = `${item}`;
	});

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

	if (!formsDirectory || !docsDirectory) {
		throw new Error("Could not get the forms directory");
	}

	const inputPath = path.join(formsDirectory, pdfFormName);
	const outputPath = path.join(docsDirectory, outputName);
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
	const length = pdfDoc.getForm().getFields().length;
	const noPassedFields = Object.values(dataObj).length;
	const emptyFields = length - noPassedFields;

	Object.entries(dataObj).map(([field, value]) => {
		const formField = pdfForm.getTextField(field);
		formField.setText(value);
	});

	for (let n = noPassedFields; n < emptyFields; n++) {
		try {
			const formField = pdfForm.getTextField(n.toString());
			formField.setText("");
		} catch {
			// Do nothing, the field does not exist and so no clear is required.
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
