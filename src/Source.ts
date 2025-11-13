import { env } from "cloudflare:workers";
import type { Result } from "./Result.js";

export const CONTENT_TYPES = {
  "atom": "application/atom+xml"
} as const satisfies Record<string, string>;

export type ContentType = keyof typeof CONTENT_TYPES;

const GENERATOR = env.USER_AGENT;

type Entry = {
  id: string;
  link: string;
  title: string;
};

export abstract class Source {
  public abstract readonly id: string;
  public abstract readonly title: string;
  public abstract readonly link: string;

  public abstract getEntries(): Promise<Result<Entry[]>>;

  public async generate(type: ContentType): Promise<Result<string>> {
    const entries = await this.getEntries();
    if (!entries.ok) {
      console.error("Entries could not be retrieved.");
      return { ok: false };
    }

    if (type === "atom") return { ok: true, value: this.generateAtom(entries.value) };

    return type satisfies never;
  }

  public generateAtom(entries: Entry[]): string {
    return (
      `<?xml version="1.0" encoding="utf-8"?>` +
      `<feed xmlns="http://www.w3.org/2005/Atom">` +
      `<id>${this.id}</id>` +
      `<title>${this.title}</title>` +
      `<link href="${this.link}"/>` +
      `<generator>${GENERATOR}</generator>` +
      // `<updated>${opts.updated}</updated>` +
      // `<author>` +
      // `<name>${opts.authorName}</name>` +
      // `</author>` +
      entries.map((entry) => (
        `<entry>` +
        `<id>${entry.id}</id>` +
        `<link href="${entry.link}"/>` +
        `<title>${entry.title}</title>` +
        // `<updated>${entry.updated}</updated>` +
        `</entry>`
      )).join("") +
      `</feed>`
    );
  }
}
