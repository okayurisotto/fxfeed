import { getRedirectLocation } from "./getRedirectLocation.js";
import type { Result } from "./Result.js";
import { Source } from "./Source.js";

class FirefoxSource extends Source {
  public readonly id: string;
  public readonly title: string;
  public readonly link: string;
  public readonly baseTitle: string;

  public constructor(opts: { title: string; link: string; baseTitle: string }) {
    super();

    this.id = opts.link;
    this.title = opts.title;
    this.link = opts.link;
    this.baseTitle = opts.baseTitle;
  }

  protected getVersionFromUrl(url: string): Result<string> {
    const urlPattern = new URLPattern({ pathname: "/en-US/firefox/:version/releasenotes/" });

    const version = urlPattern.exec(url)?.pathname.groups["version"];
    if (version === undefined) {
      console.error("Version could not be inferred from URL.");
      return { ok: false };
    }

    return {
      ok: true,
      value: version,
    };
  }

  public async getEntries(): Promise<Result<{ id: string; link: string; title: string }[]>> {
    const redirected = await getRedirectLocation(this.link);
    if (!redirected.ok) {
      console.error("Redirect destination could not be retrieved.");
      return { ok: false };
    }

    const version = this.getVersionFromUrl(redirected.value);
    if (!version.ok) {
      console.error("Version could not be retrieved.");
      return { ok: false };
    }

    return {
      ok: true,
      value: [{
        id: redirected.value,
        link: redirected.value,
        title: this.baseTitle + version.value,
      }],
    };
  }
}

class FirefoxAndroidSource extends FirefoxSource {
  protected override getVersionFromUrl(url: string): Result<string> {
    const urlPattern = new URLPattern({ pathname: "/en-US/firefox/android/:version/releasenotes/" });

    const version = urlPattern.exec(url)?.pathname.groups["version"];
    if (version === undefined) {
      console.error("Version could not be inferred from URL.");
      return { ok: false };
    }

    return { ok: true, value: version };
  }
}

class FirefoxiOSSource extends FirefoxSource {
  protected override getVersionFromUrl(url: string): Result<string> {
    const urlPattern = new URLPattern({ pathname: "/en-US/firefox/ios/:version/releasenotes/" });

    const version = urlPattern.exec(url)?.pathname.groups["version"];
    if (version === undefined) {
      console.error("Version could not be inferred from URL.");
      return { ok: false };
    }

    return { ok: true, value: version };
  }
}

export const sources: Record<string, Source> = {
  "desktop": new FirefoxSource({
    title: "Firefox Release Notes - Desktop",
    link: "https://www.firefox.com/en-US/firefox/notes/",
    baseTitle: "Firefox Desktop ",
  }),
  "desktop-beta": new FirefoxSource({
    title: "Firefox Release Notes - Desktop Beta",
    link: "https://www.firefox.com/en-US/firefox/beta/notes/",
    baseTitle: "Firefox Desktop Beta ",
  }),
  "desktop-nightly": new FirefoxSource({
    title: "Firefox Release Notes - Desktop Nightly",
    link: "https://www.firefox.com/en-US/firefox/nightly/notes/",
    baseTitle: "Firefox Desktop Nightly ",
  }),
  "android": new FirefoxAndroidSource({
    title: "Firefox Release Notes - Android",
    link: "https://www.firefox.com/en-US/firefox/android/notes/",
    baseTitle: "Firefox Android ",
  }),
  "ios": new FirefoxiOSSource({
    title: "Firefox Release Notes - iOS",
    link: "https://www.firefox.com/en-US/firefox/ios/notes/",
    baseTitle: "Firefox iOS ",
  }),
};
