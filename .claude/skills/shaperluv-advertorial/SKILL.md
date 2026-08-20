---
name: shaperluv-advertorial
description: Build a "N reasons why" advertorial landing page in the exact Shaperluv format — logo bar, headline + hook, numbered reason blocks with alternating image/text columns, native-looking Shopify product block with working add-to-cart, bottom CTA, and a scroll-aware sticky BUY NOW bar. Outputs one self-contained HTML/Liquid file to paste into a Shopify Custom Liquid section. Use whenever the user asks for an advertorial, a "5 reasons" page, a listicle sales page, or a landing page "like the Shaperluv one".
---

# Shaperluv Advertorial Page

Reproduces the exact format of `shaperluv.com/pages/5-reasons-why-shaperluv-instantly-transforms-3`
for any product. The layout, type scale, spacing, colors, and sticky-CTA behavior are locked —
only copy, images, and the product handle change between advertorials.

## What you produce

**One file**: `<slug>.liquid` — self-contained (HTML + CSS + JS + Liquid), pasted into a
Shopify **Custom Liquid** section on a new page. Nothing else to install, no theme assets to
upload, no app required.

Write it to the repo root unless the user says otherwise.

## Workflow

1. **Gather inputs.** Ask only for what you can't infer. Required:
   - Product handle (the `/products/<handle>` slug) — the product block reads live data from it
   - Logo image URL (Shopify CDN URL, or reuse the store's header logo)
   - Headline + hook paragraph
   - N reasons (default 5): title + body + image URL each
   - Product section heading (e.g. `BEST SELLER - PERFECT APPEARANCE IN ANY OUTFIT`)

   If the user gives you a product URL and rough angle instead, write the copy yourself using
   `references/copy-framework.md`, then show it for approval before building.

2. **Copy the template.** Start from `assets/advertorial-template.liquid`. Fill the
   `EDIT ME` config block at the top and the content blocks. Do not restyle anything —
   the CSS is the format.

3. **Reason blocks.** Repeat the `slv-adv__reason` block once per reason. The `data-i` attribute
   drives everything automatically:
   - odd (1, 3, 5…) → white background, image left
   - even (2, 4…) → `#f5f5f5` background, image right
   No per-block CSS needed. Titles longer than ~34 characters get `data-long="true"`
   to drop to the smaller type ramp (this is what reason 4 does on the live page).

4. **Every reason title appears twice** — once in `.slv-adv__title` (desktop) and once in
   `.slv-adv__title-m` (mobile, uppercase). Keep them identical in wording. This mirrors
   the original and is what lets desktop and mobile use different type ramps.

5. **Preview it.** Liquid can't render outside Shopify, so build a static preview:

   ```
   python3 .claude/skills/shaperluv-advertorial/scripts/preview.py <slug>.liquid
   ```

   That swaps the product block for a stand-in and strips the Liquid, leaving a plain
   `.html` you can open or screenshot. It proves layout, type, alternation, and the
   sticky/CTA behavior. It does not prove the product data — that only works once pasted.

6. **Verify before handing off.** Run through `references/checklist.md`.

## Non-negotiables (this is what makes it 1:1)

- Poppins 700 headings / 400 body, `#000` headings, `#282828`–`#303030` body copy
- Content width `min(100% - 96px, 1120px)` desktop, `min(100% - 40px, 356px)` mobile
- Reason images: square (`aspect-ratio: 1/1`), `18px` radius, `430px` max desktop, full-bleed mobile
- Alternating white / `#f5f5f5` section backgrounds, image side flips with it
- The header, announcement bar, and footer are hidden — an advertorial has no navigation,
  only one exit: the product block
- Sticky BUY NOW bar hides itself once the product block is about to enter view
- Body copy is short. 1–3 sentences per reason. Never write a paragraph.

Full measurements in `references/design-spec.md`. Read it before changing any value.

## Product block

The block renders live from `all_products[handle]` — gallery with thumbnails, title, review
count, price with compare-at and savings badge, option pills, and a real `/cart/add` form.
It is not a screenshot or a link; it adds to cart in place.

If the handle is wrong or the product is unpublished, the block renders a visible warning
instead of failing silently — that is intentional, don't remove it.

Both CTAs (sticky bar and bottom button) scroll to `#slv-adv-anchor`, which sits directly
above the product block. Keep that id.

## Reference files

- `references/design-spec.md` — every measurement, color, and breakpoint, desktop + mobile
- `references/copy-framework.md` — the advertorial copy formula, with the original as annotation
- `references/checklist.md` — pre-handoff verification
- `examples/shaperluv-tank.liquid` — the original page rebuilt in this template, 1:1
- `scripts/preview.py` — turns a finished `.liquid` into a static `.html` preview

## Pasting it in

1. Shopify admin → Online Store → Pages → **Add page**, give it a title and handle
2. Save, then **Customize** the page
3. Add section → **Custom Liquid**
4. Paste the whole file → Save
5. Remove any other sections the page template added
