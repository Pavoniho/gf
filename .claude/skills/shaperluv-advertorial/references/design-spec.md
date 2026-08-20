# Design spec

Extracted from the live page. These are the values, not suggestions. Changing them
is what makes a page stop looking like the original.

## Tokens

| Token | Value |
|---|---|
| Heading font | Poppins 700 (800 for reason titles) |
| Body font | Poppins 400 |
| Heading color | `#000000` |
| Body color | `#282828` base, `#2f2f2f` reason copy, `#303030` mobile copy, `#333` hero paragraph |
| Page background | `#ffffff` |
| Alternate section background | `#f5f5f5` (even-numbered reasons, desktop only) |
| Button background | `#282828` (inline CTA) / `#000000` (sticky bar) |
| Button text | `#ffffff` |
| Border | `#dfdfdf`, hairlines `#eeeeee` desktop / `#ededed` mobile |
| Sale accent | `#de2a2a` |
| Image radius | `18px` (reason images), `12px` (product gallery) |
| Image placeholder | `#eee` desktop, `#f2f2f2` mobile |

Poppins comes from the Shopify theme. Do not add a Google Fonts link — the theme already
serves `poppins_n4`, `n6`, and `n7`. The stack falls back to system sans if the theme changes.

## Layout widths

| Region | Desktop (≥768px) | Mobile (≤767px) |
|---|---|---|
| Logo bar | `100% - 64px`, max `1180px`, height `96px` | full width, min-height `56px` |
| Logo image | `250px`, max `18vw`, max-height `74px` | `240px`, max-height `52px` |
| Hero | `min(100% - 96px, 1120px)` | full width, `22px` side padding |
| Reason row | `min(100% - 96px, 1120px)` | `min(100% - 40px, 356px)` |
| Product | `min(100% - 96px, 1180px)` | `min(100% - 40px, 366px)` |

## Type ramp

| Element | Desktop | Mobile |
|---|---|---|
| Hero headline | `clamp(28px, 2.2vw, 34px)` / 1.14, max-width 980px | `24px` / 1.12 |
| Hero paragraph | `18px` / 1.65, max-width 960px | `16px` / 1.48 |
| Reason title | `clamp(36px, 3.3vw, 52px)` / 1.03, weight 800 | hidden |
| Reason title (long) | `clamp(31px, 2.7vw, 44px)` | hidden |
| Reason title, mobile | hidden | `26px` / 1.08, weight 700, `#202020` |
| Reason title, mobile (long) | hidden | `22px` |
| Reason body | `18px` / 1.6, max-width 660px | `16px` / 1.48, `14px` top margin |
| Product heading | `clamp(28px, 2.4vw, 38px)` / 1.1, centered, max-width 900px | `26px` / 1.12 |
| Product title | `clamp(28px, 2.4vw, 38px)` / 1.05 | same clamp |

The reason title exists twice in the DOM — `.slv-adv__title` (desktop) and
`.slv-adv__title-m` (mobile, uppercase). That duplication is deliberate: the two
breakpoints need different weights and ramps, and swapping via CSS alone can't change
the casing convention.

## Spacing

- Hero: `42px 0 30px` desktop, `22px 0 18px` mobile
- Reason section: `34px 0` padding desktop, `24px 0` margin mobile
- Reason grid gap: `clamp(44px, 6vw, 84px)` desktop, `0` mobile (image sits under title)
- Product section: `68px 0 26px` desktop, `34px 0 18px` mobile
- Product heading bottom margin: `34px` desktop, `22px` mobile
- Product grid gap: `clamp(44px, 5vw, 76px)` desktop, `24px` mobile
- Bottom CTA block: `22px 0 72px` desktop, `18px 0 96px` mobile (extra room for the sticky bar)

## Reason block alternation

| Reason | Background | Image side |
|---|---|---|
| 1, 3, 5 | `#ffffff` | left |
| 2, 4 | `#f5f5f5` | right |

Driven entirely by `data-i` on `.slv-adv__reason`. Grid columns are
`minmax(300px, 430px) minmax(0, 1fr)` for odd, flipped for even with explicit
`grid-column` on the image and text so the DOM order stays image-then-copy.

On mobile everything collapses to a single white column, always title → image → copy.
Never alternate on mobile — the `#f5f5f5` background is overridden to white.

## Reason image

- `aspect-ratio: 1 / 1`, `object-fit: cover` — always square, never letterboxed
- Desktop: `max-width: 430px`, `height: clamp(360px, 30vw, 430px)`, shadow `0 18px 45px rgba(0,0,0,.08)`
- Mobile: full column width, `height: auto`, no shadow
- Serve at `&width=720` from the Shopify CDN (the GIF in reason 1 of the original uses `&width=480`)
- `loading="lazy" decoding="async"` on every reason image

## CTAs

Three ways to buy, all pointing at the same place:

1. **Sticky bar** — fixed, `220×56px` desktop / `min(76vw,300px)×52px` mobile, bottom `28px` /
   `max(14px, env(safe-area-inset-bottom))`, radius `11px` / `10px`, `z-index: 290000`
2. **Add to cart** — inside the product block, `min(100%,340px)`, min-height `58px` / `52px`
3. **Bottom button** — below the product block, same dimensions as add-to-cart

Letter-spacing is `.16em` on the large buttons, `.14em` on the sticky bar desktop,
`.12em` on mobile inline buttons. Font sizes: `22px` inline desktop, `20px` inline mobile,
`16px` sticky desktop, `14px`–`16px` sticky mobile.

### Sticky hide logic

The bar disappears once the product block is roughly one viewport away:

```
clearance = stickyHeight + clamp(96, viewportHeight * 0.14, 150)
hideAt    = productHeadingTop - viewportHeight + clearance
hidden    = clicked || scrollTop >= hideAt
```

Clicking it hides it permanently for that pageview and smooth-scrolls to `#slv-adv-anchor`.
Transition is `160ms ease` on opacity, visibility, and transform.

## Chrome removal

The theme header, announcement bar, and footer are hidden with `display: none !important`.
An advertorial has no navigation — the only way off the page is into the cart.
Toggle with `adv_hide_chrome` if a particular store needs its header.
