# LAUNCH CHECKLIST — modalruns.com

> **STATUS: LAUNCHED 2026-07-14.** All three noindex locations are removed
> (`vercel.json` was deleted entirely — it held nothing but the header),
> `robots.txt` allows crawling, and `public/sitemap.xml` exists. Remaining
> manual step: request indexing in Google Search Console — removing the block
> does not retroactively index the site. The sections below are kept as the
> historical record of what the block was and how to re-apply it if ever needed.

Production was **hidden from search engines on purpose**, so we could deploy and
test on the real domain before the site was publicly ready.

Going public was a find-and-remove job across **three files**. Grep for `TODO: LAUNCH`
to find two of them; the third (`vercel.json`) is pure JSON and cannot carry a comment,
so it is listed here instead.

---

## The three noindex locations

| # | File | What to do at launch |
|---|------|----------------------|
| 1 | `index.html` | Delete the `TODO: LAUNCH` block containing `<meta name="robots" content="noindex, nofollow" />` |
| 2 | `public/robots.txt` | Replace `Disallow: /` with `Allow: /` (the target content is written in the file's own comment) |
| 3 | `vercel.json` | Delete the `X-Robots-Tag` header entry. **No `TODO` marker exists in this file — JSON does not support comments.** If `headers` becomes empty, delete `vercel.json` entirely. |

```bash
# find locations 1 and 2
grep -rn "TODO: LAUNCH" index.html public/

# location 3 has no marker — check it by hand
grep -n "X-Robots-Tag" vercel.json
```

## Verify it worked

```bash
# should print NOTHING once launched
curl -sI https://modalruns.com | grep -i x-robots-tag
curl -s  https://modalruns.com | grep -i 'name="robots"'
curl -s  https://modalruns.com/robots.txt
```

Then request indexing in Google Search Console — removing the block does not
retroactively index the site, it only stops preventing it.

---

## Why belt *and* braces

`robots.txt` only asks crawlers not to *crawl* — a URL linked from elsewhere can still be
*indexed* without being crawled. The `noindex` meta tag and the `X-Robots-Tag` header are
what actually prevent indexing, and the header covers crawlers that ignore HTML meta tags
(and non-HTML responses like `og.png`). All three together is the safe combination.

## Scope — zero functional impact

These changes are **crawler-facing only**. They do not touch:

- Vercel deployment protection or auth
- The audio engine (drone, chord pad, metronome, progression stepper)
- The theory engine, fretboard rendering, or any app state

The app behaves identically for every human visitor. The only difference is what
search engines are told.

---

## Launch items (historical)

- [x] DNS: `modalruns.com` resolves and serves production
- [x] Remove the three noindex locations above (2026-07-14)
- [x] Persistence — `AppState` persists via `utils/persist.ts`
- [ ] Confirm the OG card renders correctly when the link is pasted (Slack/X/Discord)
- [ ] Request indexing in Google Search Console (manual, needs account access)
