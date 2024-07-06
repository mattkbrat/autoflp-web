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

export const forms: { key: Form; title: string }[] = [
	{
		key: "DR2395_2022",
		title: "Application For Title & Joint Tenancy",
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
	},
	{
		key: "Buyers Order",
		title: "Buyers Order",
	},
	{
		key: "Cover",
		title: "Cover",
	},
	{
		key: "Disclosures",
		title: "Disclosures",
	},
	{
		key: "Down Payment Statement of Fact",
		title: "Down Payment Statement of Fact",
	},
	{
		key: "Inventory",
		title: "Inventory",
	},
	{
		key: "One And The Same",
		title: "One and the Same",
	},
	{
		key: "Receipt",
		title: "Receipt",
	},
	{
		key: "DR0024_2021",
		title: "Sales Tax Receipt",
	},
	{
		key: "Security",
		title: "Security",
	},
	{
		key: "Sales Tax Statement",
		title: "Sales Tax Statement",
	},
];
