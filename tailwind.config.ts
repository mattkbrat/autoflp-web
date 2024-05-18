import { join } from "path";
import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import { skeleton } from "@skeletonlabs/tw-plugin";
import plugin from "tailwindcss/plugin";

export default {
	darkMode: "class",
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		join(
			require.resolve("@skeletonlabs/skeleton"),
			"../**/*.{html,js,svelte,ts}",
		),
	],
	theme: {
		extend: {},
	},
	plugins: [
		forms,
		typography,
		skeleton({
			themes: {
				preset: [
					{
						name: "vintage",
						enhancements: true,
					},
				],
			},
		}),
		plugin(({ addUtilities }) => {
			addUtilities({
				// https://developer.mozilla.org/en-US/docs/Web/CSS/writing-mode
				".horizontal-writing-tb": { "writing-mode": "horizontal-tb" },
				".vertical-writing-rl": { "writing-mode": "vertical-rl" },
				".vertical-writing-lr": { "writing-mode": "vertical-lr" },
				// https://developer.mozilla.org/en-US/docs/Web/CSS/text-orientation
				".orientation-mixed": { "text-orientation": "mixed" },
				".orientation-upright": { "text-orientation": "upright" },
				".orientation-sideways-right": { "text-orientation": "sideways-right" },
				".orientation-sideways": { "text-orientation": "sideways" },
				".orientation-glyph": { "text-orientation": "use-glyph-orientation" },
			});
		}),
	],
} satisfies Config;
