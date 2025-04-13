"use client";
import {
	Button,
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
} from "@headlessui/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";

const authedNavItems = [
	"Home",
	"Accounts",
	"Inventory",
	"Payments",
	"Deals",
	"Admin",
];

import clsx from "clsx";

export const Header = () => {
	const { data: session } = useSession();
	const path = usePathname();
	return (
		<div className="wrapper flex flex-wrap rounded-t-2xl lg:gap-x-8">
			<nav className="flex-1">
				<ul className="flex flex-wrap justify-between gap-x-4 lg:gap-x-16">
					<li className="">
						<a className="grid max-w-64 lg:max-w-full" href="/">
							<span className="font-black text-2xl">AutoFLP</span>
							<span className="text-wrap">
								Auto Dealer Management for Family Owned Businesses
							</span>
						</a>
					</li>
					{session?.user && (
						<li className="m-w-[40rem] hidden flex-1 place-self-end md:inline-block">
							<ul className="custom_grid">
								{authedNavItems.map((route) => {
									const href = `/${route.toLowerCase()}`;
									const isCurrent =
										path === href || (href === "/home" && path === "/");
									return (
										<li
											key={route}
											className={clsx("inline-block border-b-2", {
												"border-b-black dark:border-b-white": isCurrent,
												"border-b-transparent": !isCurrent,
											})}
										>
											<a
												href={href}
												className={clsx("inline-block w-full text-center ")}
											>
												{route}
											</a>
										</li>
									);
								})}
							</ul>
						</li>
					)}
				</ul>
			</nav>

			{session ? (
				<div className="flex flex-row-reverse items-center gap-x-2 md:contents">
					<div className="inline-block md:hidden">
						<Menu>
							<MenuButton className="inline-flex h-1/2 items-center gap-2 rounded-md bg-gray-200 px-3 py-1.5 font-semibold text-sm/6 shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-300 data-[open]:bg-gray-300 data-[focus]:outline-1 data-[focus]:outline-white dark:bg-gray-800 dark:data-[hover]:bg-gray-700 dark:data-[open]:bg-gray-700 ">
								Nav
								{/* <ChevronDownIcon className="size-4 fill-white/60" /> */}
							</MenuButton>
							<MenuItems
								transition
								anchor="bottom end"
								className="z-10 origin-top-right rounded-xl border border-white/5 bg-white p-1 text-sm/6 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 dark:bg-black"
							>
								{authedNavItems.map((route) => {
									const href = `/${route.toLowerCase()}`;
									const isCurrent =
										path === href || (href === "/home" && path === "/");
									return (
										<MenuItem key={href}>
											<a
												href={href}
												className="group flex w-full items-center gap-2 rounded-lg bg-hover px-3 py-1.5"
											>
												{route}
											</a>
										</MenuItem>
									);
								})}
							</MenuItems>
						</Menu>
					</div>
					<Menu>
						<MenuButton className="inline-flex h-1/2 items-center gap-2 self-center rounded-md bg-gray-200 px-3 py-1.5 font-semibold text-sm/6 shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-300 data-[open]:bg-gray-300 data-[focus]:outline-1 data-[focus]:outline-white dark:bg-gray-800 dark:data-[hover]:bg-gray-700 dark:data-[open]:bg-gray-700">
							Account
							{/* <ChevronDownIcon className="size-4 fill-white/60" /> */}
						</MenuButton>

						<MenuItems
							transition
							anchor="bottom end"
							className="z-10 origin-top-right rounded-xl border border-white/5 bg-white p-1 text-sm/6 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 dark:bg-black"
						>
							<MenuItem>
								<span className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5">
									{session.user.name}
								</span>
							</MenuItem>
							<MenuItem>
								<Button
									className="group flex w-full items-center gap-2 rounded-lg bg-hover px-3 py-1.5"
									onClick={() => {
										signOut();
										redirect("/");
									}}
								>
									Sign Out
								</Button>
							</MenuItem>

							<div className="my-1 h-px bg-black/5 dark:bg-white/5" />
							<MenuItem>
								<Button
									type="button"
									className="group flex w-full items-center gap-2 rounded-lg bg-hover px-3 py-1.5"
									onClick={() => {
										const root = document.getElementsByTagName("html")[0];
										if (!root) return;
										if (root.classList.contains("dark")) {
											root.classList.remove("dark");
										} else {
											root.classList.add("dark");
										}
									}}
								>
									<span className="whitespace-normal break-words leading-6">
										Toggle theme
									</span>
								</Button>
							</MenuItem>
						</MenuItems>
					</Menu>
				</div>
			) : (
				<Button
					onClick={() => {
						signIn();
					}}
				>
					Sign In
				</Button>
			)}
		</div>
	);
};
