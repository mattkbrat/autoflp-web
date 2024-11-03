import { describe, test, expect } from "vitest";
import { sendNotification, type PushoverNotification } from ".";

describe.skip("Can notify", async () => {
	const notification: PushoverNotification = {
		message: "This is a test message",
	};
	const notified = await sendNotification(notification);
	test("Notification sent", () => {
		expect(notified).toBeTruthy();
	});
});
