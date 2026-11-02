# Mo Landing

Personal Movember fundraising page. Astro + Tailwind, deployed to Cloudflare Workers.

The page is prerendered. The only thing rendered at request time is the fundraising card, which is an Astro server island that reads the Movember API through `src/lib/movember.ts` and caches the result in memory for 15 minutes.

## Commands

```sh
pnpm install
pnpm dev              # http://localhost:4342
pnpm build            # builds to dist/
pnpm deploy           # build and deploy with wrangler
```

## Each November

1. Edit `src/config/campaign.ts`: year, goal fallback, copy, event details and links.
2. Empty `src/assets/mo/` and add this year's photos.
3. Set `site` in `astro.config.mjs` if the domain changes.

## Daily photos

Drop square photos into `src/assets/mo/` named by campaign day:

```
src/assets/mo/day-01.jpg
src/assets/mo/day-02.jpg
...
```

Day 1 maps to the `photoStart` date in `src/config/campaign.ts` (November 1). Photos are picked up automatically, sorted by day number, and optimized at build time. Missing days are fine.

## Project layout

```
src/
  config/campaign.ts     everything that changes year to year
  lib/movember.ts        Movember API adapter + normalized data model
  lib/cache.ts           cache interface (memory now, KV later)
  lib/photos.ts          loads and sorts the daily photos
  components/            page sections
  layouts/Base.astro     document shell, fonts, meta tags
  pages/index.astro      the page
  assets/mo/             daily photos
  assets/firestash.avif  the flaming moustache
```

## Swapping the cache for Cloudflare KV

Implement `CacheStore` from `src/lib/cache.ts` on top of a KV binding and call `setFundraisingCache()` from middleware or the server island before `getFundraising()` runs. Nothing else needs to change.
