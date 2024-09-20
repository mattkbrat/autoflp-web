import type { Form } from "$lib/types/forms";
import { PDFDocument } from "pdf-lib";
import { generate } from "./generate";
import type { GenerateFormParams } from ".";

type Files = Array<[GenerateFormParams["data"], Form]>;

export const mergePdfs = async (files: Files) => {
	///  Assume you have some data and some pdf documents with fields
	// fill the fields in each form, serialize the filled form into bytes and reload the bytes into a new PDF
	const pdfFiles: Array<Promise<PDFDocument>> = files.map(
		async ([formData, form]) => {
			const props: GenerateFormParams = {
				form,
				data: formData,
				attachments: [],
				returnType: "bytes",
			};
			const pageBytes = await generate(props);
			if ("output" in pageBytes) throw new Error("Unexpected result");
			return await PDFDocument.load(pageBytes);
		},
	);

	const [head, ...rest] = pdfFiles;

	/// Now reduce the promises from left to right and combine the documents
	return rest.reduce(async (l, r) => {
		return await Promise.all([l, r]).then(
			async ([l, r]) =>
				await l.copyPages(r, r.getPageIndices()).then((pgs) => {
					for (const page of pgs) {
						l.addPage(page);
					}
					return l;
				}),
		);
	}, head) as Promise<PDFDocument>;
};
