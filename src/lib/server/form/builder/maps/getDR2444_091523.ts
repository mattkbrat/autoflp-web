export const get = () => {
	return {
		Name: "",
		"Vehicle Identification Number (V I N)": "",
		Year: "",
		Make: "",
		"Title Number": "",
		Statement: "",
		Signature: "",
		"Date of Signature": "",
	};
};
export type Template = ReturnType<typeof get>;