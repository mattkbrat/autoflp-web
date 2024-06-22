/*
POST /1/messages.json HTTP/1.1
Host: api.pushover.net
Content-Type: application/x-www-form-urlencoded
Content-Length: 180

POST an HTTPS request to https://api.pushover.net/1/messages.json with the following parameters:

    token - your application's API token (required)
    user - your user/group key (or that of your target user), viewable when logged into our dashboard; often referred to as USER_KEY in our documentation and code examples (required)
    message - your message (required) 

Some optional parameters may also be included:

    attachment - an image attachment to send with the message (documentation)
    device - the name of one of your devices to send just to that device instead of all devices (documentation)
    html - set to 1 to enable HTML parsing (documentation)
    priority - a value of -2, -1, 0 (default), 1, or 2 (documentation)
    sound - the name of a supported sound to override your default sound choice (documentation)
    timestamp - a Unix timestamp of a time to display instead of when our API received it (documentation)
    title - your message's title, otherwise your app's name is used
    url - a supplementary URL to show with your message (documentation)
    url_title - a title for the URL specified as the url parameter, otherwise just the URL is shown (documentation) 

*/

import { PUSHOVER_TOKEN, PUSHOVER_USER } from "$env/static/private";

const sounds = [
	"pushover",
	"bike",
	"bugle",
	"cashregister",
	"classical",
	"cosmic",
	"falling",
	"gamelan",
	"incoming",
	"intermission",
	"magic",
	"mechanical",
	"pianobar",
	"siren",
	"spacealarm",
	"tugboat",
	"alien",
	"climb",
	"persistent",
	"echo",
	"updown",
	"vibrate",
	"none",
] as const;

export type PushoverNotification = {
	message: string;
	title?: string;
	url?: string;
	url_title?: string;
	sound?: (typeof sounds)[number];
	priority?: -2 | -1 | 0 | 1 | 2;
};

export const sendNotification = async (p: PushoverNotification) => {
	if (!PUSHOVER_TOKEN || !PUSHOVER_USER) {
		return;
	}

	if (typeof p.message === "undefined") {
		return;
	}

	if (typeof p.sound !== "undefined" && !sounds.includes(p.sound)) {
		console.error("Invalid sound", p.sound, "defaulting to pushover");
		p.sound = undefined;
	}

	const params: PushoverNotification & {
		retry?: number;
		expire?: number;
	} = {
		...p,
		message: p.message.trim().replaceAll(/\s+/g, " "),
	};

	if (p.priority === 2) {
		params.retry = 60;
		params.expire = 3600;
	}

	const body = Object.entries(params).reduce(
		(acc, [k, v]) => {
			if (!v) return acc;

			acc.set(k, v.toString());
			return acc;
		},
		new URLSearchParams({
			token: PUSHOVER_TOKEN,
			user: PUSHOVER_USER,
		}),
	);

	const response = await fetch("https://api.pushover.net/1/messages.json", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body,
	});

	const responseJson = (await response.json()) as {
		status: number;
		request: string;
	};

	const isSuccess = responseJson.status === 1 && response.status === 200;

	if (!isSuccess) {
		console.error("Pushover failed", responseJson);
		return false;
	}

	return true;
};
