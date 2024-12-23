import { getDetailedDeal } from "$lib/server/database/deal";
import { describe, it, assert, expect, vi, test } from "vitest";
import { builder } from ".";
import { forms } from "$lib/types/forms";
import { env } from "$env/dynamic/private";
import { existsSync, statSync } from "node:fs";
import { AUTOFLP_DATA_DIR } from "$lib/server";

describe("Can generate forms from pre-created deal", async () => {
	const expectedForms = forms.map((i) => {
		return { form: i.key };
	});

	expect(existsSync(AUTOFLP_DATA_DIR)).toBeTruthy();

	it.each(expectedForms)(
		"generates and exepcts attributes of $form",
		async ({ form }) => {
			if (!form) {
				throw new Error("Unkown form", form);
			}

			// return;

			vi.setConfig({ testTimeout: 100_000 });
			const dealId = env.TEST_DEAL_ID;

			expect(dealId?.length).toBeGreaterThan(0);

			const detailed = await getDetailedDeal({ id: dealId });

			assert(!!detailed, `Could not get a detailed deal by id: ${dealId}`);
			assert(!!detailed.inventory.vin, "Deal has no inventory vin");
			assert(!!detailed.account.contact, "Deal has no account contact");

			const i = await builder({ deal: detailed, form: form });

			expect(i).toBeDefined();
			expect(i).not.toBeInstanceOf(Uint8Array);

			if (!i || i instanceof Uint8Array) {
				throw new Error(`Invalid i result for ${i}`);
			}

			expect(i).toHaveProperty("output");

			const path = `${AUTOFLP_DATA_DIR}/${i.output}`;
			console.log("checking path", path);

			expect(existsSync(path)).toBeTruthy();

			const stats = statSync(path);

			expect(stats.isFile()).toBeTruthy();
			expect(stats.size).toBeGreaterThan(1_000);
			expect(stats.size).toBeLessThan(10_000_000);
		},
	);
});
