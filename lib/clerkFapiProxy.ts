const PROD_FAPI_URL = "https://frontend-api.clerk.dev";
const PROXY_PATH = "/__clerk";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const RESPONSE_HEADERS_TO_STRIP = new Set(["content-encoding", "content-length"]);

function clientIp(request: Request): string | undefined {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  );
}

function publicOrigin(request: Request, requestUrl: URL): string {
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (proto && host) {
    return `${proto}://${host}`;
  }
  return requestUrl.origin;
}

export async function proxyClerkFrontendApi(request: Request): Promise<Response> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey?.startsWith("sk_live_")) {
    return new Response(null, { status: 404 });
  }

  const requestUrl = new URL(request.url);
  if (
    requestUrl.pathname !== PROXY_PATH &&
    !requestUrl.pathname.startsWith(`${PROXY_PATH}/`)
  ) {
    return new Response(null, { status: 404 });
  }

  const fapiHost = new URL(PROD_FAPI_URL).host;
  const targetPath = requestUrl.pathname.slice(PROXY_PATH.length) || "/";
  const targetUrl = new URL(`${PROD_FAPI_URL}${targetPath}`);
  targetUrl.search = requestUrl.search;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const proxyUrl = `${publicOrigin(request, requestUrl)}${PROXY_PATH}`;
  headers.set("Clerk-Proxy-Url", proxyUrl);
  headers.set("Clerk-Secret-Key", secretKey);
  headers.set("Host", fapiHost);
  headers.set("Accept-Encoding", "identity");
  if (!headers.has("X-Forwarded-Host")) {
    headers.set("X-Forwarded-Host", requestUrl.host);
  }
  if (!headers.has("X-Forwarded-Proto")) {
    headers.set("X-Forwarded-Proto", requestUrl.protocol.replace(":", ""));
  }
  const ip = clientIp(request);
  if (ip) {
    headers.set("X-Forwarded-For", ip);
  }

  const fetchOptions: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (request.body !== null) {
    fetchOptions.body = request.body;
    fetchOptions.duplex = "half";
  }

  const response = await fetch(targetUrl, fetchOptions);
  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower) || RESPONSE_HEADERS_TO_STRIP.has(lower)) {
      return;
    }
    if (lower === "set-cookie") {
      responseHeaders.append(key, value);
    } else {
      responseHeaders.set(key, value);
    }
  });

  const location = response.headers.get("location");
  if (location) {
    try {
      const locationUrl = new URL(location, PROD_FAPI_URL);
      if (locationUrl.host === fapiHost) {
        responseHeaders.set(
          "Location",
          `${proxyUrl}${locationUrl.pathname}${locationUrl.search}${locationUrl.hash}`,
        );
      }
    } catch {
      // Keep the upstream Location header when it is not a valid URL.
    }
  }

  const proxied = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
  for (const header of RESPONSE_HEADERS_TO_STRIP) {
    proxied.headers.delete(header);
  }
  return proxied;
}
