# fxfeed: Unofficial Firefox Release Notes Feed

A lightweight Atom feed generator for the latest Firefox release notes.
The feed is available at [fxfeed.okayurisotto.net](https://fxfeed.okayurisotto.net/).

## Overview

**fxfeed** is a tiny Cloudflare Worker that provides an Atom feed for the most recent Firefox release notes. Since Mozilla currently does not offer an official RSS or Atom feed for this information, this tool follows the public redirect already used on the Firefox website.

The Worker generates feeds on a scheduled Cloudflare Cron Trigger and writes them to Cloudflare R2. The cron schedule is `0 * * * *`, so the feed is refreshed hourly.

HTTP requests are not served by generating feed content in the Worker. Instead, the `fetch` handler returns a redirect to the corresponding object hosted from R2, where the generated Atom feed is delivered.

The Worker identifies itself as:

```
User-Agent: fxfeed/0.2.0 (+https://github.com/okayurisotto/fxfeed)
```

## Disclaimer

This project was created for personal convenience and is shared publicly in case others find it useful. It is not affiliated with or endorsed by Mozilla in any way. Please use this project responsibly and at your own risk.

This project was made out of respect and appreciation for Mozilla and the open web — not to exploit or burden their services. If you find it helpful, consider suggesting that Mozilla offer an official release notes feed.
