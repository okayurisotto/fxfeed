import { CONTENT_TYPES, type ContentType } from "./Source.js";
import { sources } from "./sources.js";

const getFallback = (status: number): Response => {
  return new Response(
    `<!DOCTYPE html>` +
    `<html lang="en">` +
    `<title>Unofficial Firefox Release Notes Feed</title>` +
    Object.entries(sources).map(([channel, { title: name }]) => (
      `<link rel="alternate" type="application/atom+xml" href="/${channel}/atom" title="${name}">`
    )).join("") +
    `<h1>Unofficial Firefox Release Notes Feed</h1>` +
    `<p>` +
    `The source code is available on <a href="https://github.com/okayurisotto/fxfeed">GitHub</a>.` +
    `<br>` +
    `For more information, see the <code>README.md</code> in the GitHub repository.` +
    `</p>` +
    `<hr>` +
    `<h2>RSS 1.0</h2>` +
    `<p>Not implemented.` +
    `<h2>RSS 2.0</h2>` +
    `<p>Not implemented.` +
    `<h2>Atom</h2>` +
    `<ul>` +
    Object.entries(sources).map(([channel, { title: name }]) => (
      `<li><a href="/${channel}/atom">${name}</a>`
    )).join("") +
    `</ul>` +
    ``,
    {
      status: status,
      headers: {
        "Content-Type": "text/html",
      },
    },
  );
};

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const pathname = new URL(request.url).pathname;

    if (request.method !== "GET") {
      return getFallback(405);
    }

    if (pathname === "/") {
      return getFallback(200);
    }

    const result = new URLPattern({ pathname: "/:channel/:type" }).exec(request.url);
    if (result === null) return getFallback(404);

    const channel = result.pathname.groups["channel"];
    if (channel === undefined) return getFallback(404);

    const type = result.pathname.groups["type"];
    if (type === undefined) return getFallback(404);
    if (type !== "atom") return getFallback(404);

    const source = sources[channel];
    if (source === undefined) return getFallback(404);

    const feed = await source.generate(type);
    if (!feed.ok) {
      console.error("Feed could not be generated.", `channel:${channel}, type:${type}`);
      return new Response(null, { status: 500 });
    }

    return new Response(
      feed.value,
      {
        status: 200,
        headers: {
          "Content-Type": "application/atom+xml",
        },
      },
    );
  },
  async scheduled(controller, env, ctx): Promise<void> {
    for (const [channel, source] of Object.entries(sources)) {
      for (const [type_, contentType] of Object.entries(CONTENT_TYPES)) {
        const type = type_ as ContentType;

        const feed = await source.generate(type);

        if (feed.ok) {
          await env.fxfeed.put(`${channel}/${type}`, feed.value, {
            httpMetadata: {
              contentType: contentType,
            },
          });
          console.log("The feed has been generated.", `${channel}/${type}`);
        } else {
          console.error("The feed could not be generated.", `${channel}/${type}`);
        }

        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  },
} satisfies ExportedHandler<Env>;
