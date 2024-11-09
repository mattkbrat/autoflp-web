import { dev } from "$app/environment";
import {
	PROD_SITE_URL,
	PUSHOVER_TOKEN,
	PUSHOVER_TOKEN_PROD,
	SITE_URL,
} from "$env/static/private";

export const siteUrl = dev ? SITE_URL : PROD_SITE_URL;
export const pushoverToken = dev ? PUSHOVER_TOKEN : PUSHOVER_TOKEN_PROD;