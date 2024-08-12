const formOptions = [
	//"Application for Title andor Registration 031522", //DR2395_2022
	"DR2395_2022",
	"Application",
	"billing",
	"Buyers Guide",
	"Buyers Order",
	"Cover",
	"Disclosures",
	"Down Payment Statement of Fact",
	"Inventory",
	"One And The Same",
	"Receipt",
	"DR0024_2021", // Sales Tax Receipt
	"Security",
	"Sales Tax Statement",
] as const;

export type Form = (typeof formOptions)[number];

type FormType = "deal" | "inventory";

export const forms: { key: Form; title: string; type?: FormType[] }[] = [
	{
		key: "DR2395_2022",
		title: "Application For Title & Joint Tenancy",
		type: ["deal"],
	},
	{
		key: "Application",
		title: "Application",
	},
	{
		key: "billing",
		title: "Billing",
	},
	{
		key: "Buyers Guide",
		title: "Buyers Guide",
		type: ["deal", "inventory"],
	},
	{
		key: "Buyers Order",
		title: "Buyers Order",
		type: ["deal"],
	},
	{
		key: "Cover",
		title: "Cover",
		type: ["deal"],
	},
	{
		key: "Disclosures",
		title: "Disclosures",
		type: ["deal"],
	},
	{
		key: "Down Payment Statement of Fact",
		title: "Down Payment Statement of Fact",
		type: ["deal"],
	},
	{
		key: "Inventory",
		title: "Inventory",
	},
	{
		key: "One And The Same",
		title: "One and the Same",
		type: ["deal"],
	},
	{
		key: "Receipt",
		title: "Receipt",
	},
	{
		key: "DR0024_2021",
		title: "Sales Tax Receipt",
		type: ["deal"],
	},
	{
		key: "Security",
		title: "Security",
		type: ["deal"],
	},
	{
		key: "Sales Tax Statement",
		title: "Sales Tax Statement",
		type: ["deal"],
	},
];

export const dealForms = forms.filter((f) => f.type?.includes("deal"));
export const inventoryForms = forms.filter((f) =>
	f.type?.includes("inventory"),
);
