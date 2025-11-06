import { env } from "cloudflare:workers";
import type { Result } from "./Result.js";

const CACHE_TTL = 3 * 60; // 3 minutes

export const getRedirectLocation = async (url: string): Promise<Result<string>> => {
  const response = await fetch(url, {
    method: "HEAD",
    redirect: "manual",
    headers: {
      "User-Agent": env.USER_AGENT,
    },
    cf: {
      cacheEverything: true,
      cacheTtl: CACHE_TTL,
    },
  });

  const location = response.headers.get("Location");
  if (location === null) {
    console.error("Location header is missing.");
    return { ok: false };
  }

  return {
    ok: true,
    value: new URL(location, url).href,
  };
};
