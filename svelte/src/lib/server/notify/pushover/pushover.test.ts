import { describe, test, expect } from "vitest";
import { type PushoverNotification } from ".";
import { sendNotification } from "./sendNotification";

describe.skip("Can notify", async () => {
	const notification: PushoverNotification = {
		message: "This is a test message",
	};
	const notified = await sendNotification(notification);
	test("Notification sent", () => {
		expect(notified).toBeTruthy();
	});
});
