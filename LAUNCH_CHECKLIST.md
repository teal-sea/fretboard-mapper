# LAUNCH CHECKLIST — modalruns.com

Production is currently **hidden from search engines on purpose**, so we can deploy and
test on the real domain before the site is publicly ready.

Going public is a find-and-remove job across **three files**. Grep for `TODO: LAUNCH`
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

## Still to do before launch

- [ ] DNS: add the GoDaddy records so `modalruns.com` resolves (A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`)
- [ ] Remove the three noindex locations above
- [ ] Persistence — the app currently forgets everything on refresh
- [ ] Confirm the OG card renders correctly when the link is pasted (Slack/X/Discord)
