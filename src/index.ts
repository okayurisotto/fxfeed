import { CONTENT_TYPES, type ContentType } from "./Source.js";
import { getSources } from "./getSources.js";

export default {
  async fetch(request, _env, _ctx): Promise<Response> {
    const pathname = new URL(request.url).pathname;

    return new Response(null, {
      status: 301,
      headers: {
        "Location": new URL(pathname, "https://fxfeed.okayurisotto.net/").href,
      },
    });
  },

  async scheduled(_controller, env, _ctx): Promise<void> {
    const sources = getSources();

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
      }

      await new Promise((r) => setTimeout(r, 3000));
    }
  },
} satisfies ExportedHandler<Env>;
