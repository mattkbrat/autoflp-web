
import { writable } from "svelte/store";
export type ToastProps = {
	id: number;
	title: string;
	status: "error" | "info" | "success";
	description?: string;
	initTime: number;
	displayTime: number;
	json?: string | { [key: string]: unknown };
};

export const toastStore = writable<ToastProps[]>([]);
export const removeToast = (id: number) => {
	toastStore.update((curr) => {
		const index = curr.findIndex((t) => t.id === id);
		if (index === -1) return curr;
		curr.splice(index, 1);
		return curr;
	});
};

export const toast = (
	toastProps: Partial<Omit<ToastProps, "initTime" | "id">> & { title: string },
) => {
	const displayTime =
		toastProps.displayTime || toastProps.status === "error" ? 20_000 : 5_000;
	const status = toastProps.status || "info";
	toastStore.update((curr) => {
		const id = curr[curr.length - 1]?.id + 1 || 0;
		setTimeout(() => {
			removeToast(id);
		}, displayTime);
		const newToast = Object.assign(toastProps, {
			initTime: new Date().getTime(),
			id,
			status,
			displayTime,
		});

		curr.splice(0, 0, newToast);
		return curr;
	});
};

export const clearToasts = () => {
	toastStore.set([]);
};
