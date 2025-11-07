# fxfeed: Unofficial Firefox Release Notes Feed

A lightweight Atom feed generator for the latest Firefox release notes.
The feed is available at [fxfeed.okayurisotto.workers.dev](https://fxfeed.okayurisotto.workers.dev/).

## Overview

**fxfeed** is a tiny Cloudflare Worker that provides an Atom feed for the most recent Firefox release notes. Since Mozilla currently does not offer an official RSS or Atom feed for this information, this tool follows the public redirect already used on the Firefox website.

1. When someone accesses the fxfeed endpoint, the Worker sends a single HEAD request to the official Firefox release notes redirect URL (e.g. `https://www.firefox.com/en-US/firefox/notes/`).
2. It retrieves the value of the `Location` header from the response.
3. It returns a minimal Atom feed containing one entry pointing to that URL.
4. Responses are cached for 3 minutes to minimize requests and avoid unnecessary load on Mozilla’s servers.

The Worker identifies itself as:

```
User-Agent: fxfeed/0.1.1 (+https://github.com/okayurisotto/fxfeed)
```

## Disclaimer

This project was created for personal convenience and is shared publicly in case others find it useful. It is not affiliated with or endorsed by Mozilla in any way. Please use this project responsibly and at your own risk.

This project was made out of respect and appreciation for Mozilla and the open web — not to exploit or burden their services. If you find it helpful, consider suggesting that Mozilla offer an official release notes feed.
