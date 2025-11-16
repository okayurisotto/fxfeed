import { CONTENT_TYPES, type ContentType } from "./Source.js";
import { sources } from "./sources.js";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const pathname = new URL(request.url).pathname;

    return new Response(null, {
      status: 301,
      headers: {
        "Location": new URL(pathname, "https://fxfeed.okayurisotto.net/").href,
      },
    });
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
