import { env } from "cloudflare:workers";
import type { Result } from "./Result.js";

export const CONTENT_TYPES = {
  "markdown": "text/markdown",
  "html": "text/html",
  "rss1": "application/rdf+xml",
  "rss2": "application/rss+xml",
  "atom": "application/atom+xml",
  "jsonfeed": "application/feed+json",
} as const satisfies Record<string, string>;

export type ContentType = keyof typeof CONTENT_TYPES;

const GENERATOR = env.USER_AGENT;

type Entry = {
  id: string;
  link: string;
  title: string;
};

const escapeHtml = (value: string): string => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const escapeMarkdown = (value: string): string => {
  return value.replaceAll(/([\\[\]()])/g, "\\$1");
};

export abstract class Source {
  public abstract readonly id: string;
  public abstract readonly title: string;
  public abstract readonly link: string;

  public entries: Entry[] | null = null;

  public abstract getEntries(): Promise<Result<Entry[]>>;

  public async generate(type: ContentType): Promise<Result<string>> {
    if (this.entries === null) {
      const entries = await this.getEntries();
      if (entries.ok) {
        this.entries = entries.value;
      } else {
        console.error("Entries could not be retrieved.");
        return { ok: false };
      }
    }

    if (type === "markdown") return { ok: true, value: this.generateMarkdown(this.entries) };
    if (type === "html") return { ok: true, value: this.generateHtml(this.entries) };
    if (type === "rss1") return { ok: true, value: this.generateRss1(this.entries) };
    if (type === "rss2") return { ok: true, value: this.generateRss2(this.entries) };
    if (type === "atom") return { ok: true, value: this.generateAtom(this.entries) };
    if (type === "jsonfeed") return { ok: true, value: this.generateJsonFeed(this.entries) };

    return type satisfies never;
  }

  public generateMarkdown(entries: Entry[]): string {
    return [
      `# ${this.title}`,
      "",
      ...entries.map((entry) => `- [${escapeMarkdown(entry.title)}](${entry.link})`),
      "",
    ].join("\n");
  }

  public generateHtml(entries: Entry[]): string {
    return (
      `<!DOCTYPE html>` +
      `<html lang="en">` +
      `<head>` +
      `<meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<title>${escapeHtml(this.title)}</title>` +
      `</head>` +
      `<body>` +
      `<main>` +
      `<h1>${escapeHtml(this.title)}</h1>` +
      `<ul>` +
      entries.map((entry) => (
        `<li>` +
        `<a href="${escapeHtml(entry.link)}">${escapeHtml(entry.title)}</a>` +
        `</li>`
      )).join("") +
      `</ul>` +
      `</main>` +
      `</body>` +
      `</html>`
    );
  }

  public generateRss1(entries: Entry[]): string {
    return (
      `<?xml version="1.0" encoding="utf-8"?>` +
      `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://purl.org/rss/1.0/">` +
      `<channel rdf:about="${escapeHtml(this.link)}">` +
      `<title>${escapeHtml(this.title)}</title>` +
      `<link>${escapeHtml(this.link)}</link>` +
      `<description>${escapeHtml(this.title)}</description>` +
      `</channel>` +
      `<items>` +
      `<rdf:Seq>` +
      entries.map((entry) => `<rdf:li rdf:resource="${escapeHtml(entry.link)}"/>`).join("") +
      `</rdf:Seq>` +
      `</items>` +
      entries.map((entry) => (
        `<item rdf:about="${escapeHtml(entry.link)}">` +
        `<title>${escapeHtml(entry.title)}</title>` +
        `<link>${escapeHtml(entry.link)}</link>` +
        `<description>${escapeHtml(entry.title)}</description>` +
        `</item>`
      )).join("") +
      `</rdf:RDF>`
    );
  }

  public generateRss2(entries: Entry[]): string {
    return (
      `<?xml version="1.0" encoding="utf-8"?>` +
      `<rss version="2.0">` +
      `<channel>` +
      `<title>${escapeHtml(this.title)}</title>` +
      `<link>${escapeHtml(this.link)}</link>` +
      `<description>${escapeHtml(this.title)}</description>` +
      `<generator>${escapeHtml(GENERATOR)}</generator>` +
      entries.map((entry) => (
        `<item>` +
        `<guid isPermaLink="true">${escapeHtml(entry.link)}</guid>` +
        `<title>${escapeHtml(entry.title)}</title>` +
        `<link>${escapeHtml(entry.link)}</link>` +
        `<description>${escapeHtml(entry.title)}</description>` +
        `</item>`
      )).join("") +
      `</channel>` +
      `</rss>`
    );
  }

  public generateAtom(entries: Entry[]): string {
    return (
      `<?xml version="1.0" encoding="utf-8"?>` +
      `<feed xmlns="http://www.w3.org/2005/Atom">` +
      `<id>${escapeHtml(this.id)}</id>` +
      `<title>${escapeHtml(this.title)}</title>` +
      `<link href="${escapeHtml(this.link)}"/>` +
      `<generator>${escapeHtml(GENERATOR)}</generator>` +
      entries.map((entry) => (
        `<entry>` +
        `<id>${escapeHtml(entry.id)}</id>` +
        `<link href="${escapeHtml(entry.link)}"/>` +
        `<title>${escapeHtml(entry.title)}</title>` +
        `</entry>`
      )).join("") +
      `</feed>`
    );
  }

  public generateJsonFeed(entries: Entry[]): string {
    return (
      JSON.stringify({
        version: "https://jsonfeed.org/version/1.1",
        title: this.title,
        home_page_url: this.link,
        items: entries.map((entry) => ({
          id: entry.id,
          url: entry.link,
          title: entry.title,
          content_text: entry.title,
        })),
      })
    );
  }
}
