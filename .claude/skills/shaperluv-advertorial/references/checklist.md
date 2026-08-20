# Pre-handoff checklist

Run every item before telling the user the page is ready.

## Config
- [ ] `adv_handle` is the real product slug from `/products/<handle>` — not the title, not the ID
- [ ] Product is published to the Online Store sales channel
- [ ] `adv_logo` resolves (open the URL) and is a transparent PNG or SVG
- [ ] `adv_review_count` matches the store's actual review widget, if it has one

## Content
- [ ] Every `[PLACEHOLDER]` is gone — grep the file for `[` and for `REPLACE`
- [ ] Each reason's desktop `.slv-adv__title` and mobile `.slv-adv__title-m` say the same thing
- [ ] `data-i` runs 1, 2, 3… with no gaps — the alternation depends on it
- [ ] Titles longer than ~34 characters carry `data-long="true"`
- [ ] Every reason image URL ends in `&width=720` (or `&width=480` for GIFs)
- [ ] Every reason image has a real `alt`
- [ ] No reason body runs longer than three sentences

## Behavior
- [ ] Both CTAs point at `#slv-adv-anchor` and that span still exists above the product block
- [ ] Variant pills change price and the hidden `id` input
- [ ] Add to cart actually adds — click it on the published page, check the cart
- [ ] Sticky bar disappears as the product heading approaches, and after being clicked
- [ ] Sold-out variants grey out and the button reads `SOLD OUT`

## Rendering

Build the preview first: `python3 .claude/skills/shaperluv-advertorial/scripts/preview.py <file>.liquid`

- [ ] Desktop: reasons 2 and 4 have grey backgrounds and images on the right
- [ ] Mobile at 375px: single white column, no horizontal scroll, uppercase titles
- [ ] Theme header, announcement bar, and footer are hidden
- [ ] Sticky bar doesn't cover the bottom CTA on mobile — that's what the `96px` bottom margin is for
