import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";
import { locales } from "./request";

/**
 * Locale-aware versions of Next.js navigation primitives. Use these in
 * client components so internal links stay prefixed correctly when the
 * user is on a non-default locale.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

export { locales };
