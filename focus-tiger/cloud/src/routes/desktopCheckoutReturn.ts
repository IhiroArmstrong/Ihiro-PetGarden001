import { errorJson } from "../lib/http.ts";
import { DESKTOP_CHECKOUT_ORIGIN } from "../lib/checkoutReturnUrls.ts";

/**
 * GET /checkout/desktop-return?product=1&pro_session=cs_…
 *
 * Stripe accepts https success URLs; macOS often fails when Stripe redirects
 * directly to focus-tiger://. This bridge page immediately deep-links into the
 * Electron shell (with a manual link fallback). It is not the product app.
 */
export function handleDesktopCheckoutReturn(request: Request): Response {
	const url = new URL(request.url);
	if (url.pathname !== "/checkout/desktop-return") {
		return errorJson(404, "not_found", "Unknown path");
	}

	const params = new URLSearchParams(url.search);
	if (!params.has("product")) params.set("product", "1");
	const qs = params.toString();
	const deepLink = `${DESKTOP_CHECKOUT_ORIGIN}/?${qs}`;
	const safeHref = deepLink.replace(/"/g, "&quot;");
	const jsHref = JSON.stringify(deepLink);

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0;url=${safeHref}" />
  <title>Focus Tiger</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f5efe6; color: #3d3429; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; text-align: center; }
    a { color: #6b5344; }
  </style>
</head>
<body>
  <p>Returning to the Focus Tiger desktop app…</p>
  <p>You can close this browser tab.</p>
  <p><a href="${safeHref}">Open Focus Tiger</a></p>
  <script>window.location.replace(${jsHref});</script>
</body>
</html>`;

	return new Response(html, {
		headers: {
			"content-type": "text/html; charset=utf-8",
			"cache-control": "no-store",
		},
	});
}
