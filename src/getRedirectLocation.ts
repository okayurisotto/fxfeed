import { env } from "cloudflare:workers";
import type { Result } from "./Result.js";

export const getRedirectLocation = async (url: string): Promise<Result<string>> => {
  const response = await fetch(url, {
    method: "HEAD",
    redirect: "manual",
    headers: {
      "User-Agent": env.USER_AGENT,
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
