import type { Inventory } from "@prisma/client";
import type { DealFields } from "./finance";
import { fullNameFromPerson, type FullNameParams } from "./format";

type ZipFilenameParams =
	| {
			type: "deal";
			person: Partial<FullNameParams["person"]>;
			deal: DealFields;
	  }
	| {
			type: "inventory";
			inventory: Partial<Inventory>;
	  };

const getName = (p: ZipFilenameParams) => {
	const now = (p.type === "deal" ? p.deal.date : new Date()).toDateString();
	if (p.type === "deal") {
		const { person, deal } = p;
		const name = fullNameFromPerson({ person: person });
		return `${name}_${deal.vin}_${deal.date.toDateString()}`;
	}
	if (p.type === "inventory") {
		const {
			inventory: { make, model, year, vin },
		} = p;
		return [make, model, year, vin].filter(Boolean).join("_");
	}

	return now;
};

export const getZipFilename = (p: ZipFilenameParams) => {
	const name = getName(p);
	return name.replace(/[^a-zA-Z0-9]/g, "_");
};

export const getZip = async (forms: string[], p: ZipFilenameParams) => {
	const formsSearch = forms.map((form) => {
		return ["file", form];
	});
	const search = new URLSearchParams(formsSearch);
	return fetch(`/api/get-file?${search.toString()}`)
		.then((resp) =>
			resp.status === 200
				? resp.blob()
				: Promise.reject("something went wrong"),
		)
		.then((blob) => {
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;
			const nameBase = getZipFilename(p);
			// the filename you want
			// const urlEncoded = encodeURIComponent(name);
			a.download = `${nameBase}.zip`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			// or you know, something with better UX...
			alert("your file has downloaded!");
		});
};
