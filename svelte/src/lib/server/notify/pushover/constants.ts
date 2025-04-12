export const sounds = [
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
