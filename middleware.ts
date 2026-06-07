import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Routes incoming requests to the correct locale. With
 * `localePrefix: "as-needed"`, the default locale (English) doesn't
 * get a URL prefix; other locales do (e.g. `/ms/merge`).
 */
export default createMiddleware(routing);

export const config = {
  // Match every path except: API, static files, _next internals, the
  // service worker, manifest, and icons. Those are served verbatim.
  matcher: [
    "/((?!api|_next|sw\\.js|manifest\\.webmanifest|icons|favicon\\.ico|.*\\..*).*)",
  ],
};
