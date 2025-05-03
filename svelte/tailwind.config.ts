import { join } from "node:path";
import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import plugin from "tailwindcss/plugin";

import { skeleton } from "@skeletonlabs/skeleton/plugin";

import * as themes from "@skeletonlabs/skeleton/themes";

export default {
	darkMode: null,
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		// join(
		// 	require.resolve("@skeletonlabs/skeleton"),
		// 	"../**/*.{html,js,svelte,ts}",
		// ),
		join(
			require.resolve("@skeletonlabs/skeleton-svelte"),
			"../**/*.{html,js,svelte,ts}",
		),
	],
	theme: {},
	plugins: [
		forms,
		typography,
		skeleton({
			themes: [themes.vintage],
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
		require("tailwindcss/plugin")(({ addVariant }) => {
			addVariant("dark", "@media not print { .dark & }");
		}),
	],
} satisfies Config;
