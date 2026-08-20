#!/usr/bin/env python3
"""Render an advertorial .liquid file as a static .html preview.

Liquid can't run outside Shopify, so this strips the tags and swaps the product
block for a stand-in with realistic data. It verifies layout, type, alternation,
and the CTA/sticky JS — not the live product data.

    python3 scripts/preview.py my-advertorial.liquid [-o preview.html]
"""

import argparse
import pathlib
import re
import sys

STUB_IMAGE = "https://cdn.shopify.com/s/files/1/0763/8643/5419/files/slv-5.jpg?v=1701930781&width=900"

PRODUCT_STUB = """
    <div class="slv-adv__product-section">
      <div class="slv-adv__product-wrap">
        <h2 class="slv-adv__product-heading">__HEADING__</h2>
        <div class="slv-adv__product">
          <div class="slv-adv__media">
            <img class="slv-adv__gallery-main" id="slv-adv-main" src="__IMG__" alt="Product">
            <div class="slv-adv__thumbs">
              <button type="button" class="slv-adv__thumb" aria-current="true" data-full="__IMG__"><img src="__IMG__" alt=""></button>
            </div>
          </div>
          <div class="slv-adv__info">
            <h3 class="slv-adv__product-title">Preview Product</h3>
            <div class="slv-adv__rating"><span class="slv-adv__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span><span class="slv-adv__reviews">__REVIEWS__ reviews</span></div>
            <span class="slv-adv__deal">__DEAL__</span>
            <div class="slv-adv__prices"><span class="slv-adv__price" data-price>$49.95</span><span class="slv-adv__compare" data-compare>$99.90</span><span class="slv-adv__save" data-save>SAVE 50%</span></div>
            <div class="slv-adv__desc">__DESC__</div>
            <form method="post" action="/cart/add" id="slv-adv-form">
              <input type="hidden" name="id" id="slv-adv-variant" value="1">
              <div class="slv-adv__option" data-option-index="0">
                <span class="slv-adv__option-name">Size</span>
                <div class="slv-adv__values">
                  <button type="button" class="slv-adv__value" data-value="S" aria-pressed="true">S</button>
                  <button type="button" class="slv-adv__value" data-value="M" aria-pressed="false">M</button>
                  <button type="button" class="slv-adv__value" data-value="L" aria-pressed="false">L</button>
                </div>
              </div>
              <button type="submit" class="slv-adv__atc" id="slv-adv-atc">__CTA__</button>
            </form>
            <script type="application/json" id="slv-adv-variants">[{"id":1,"options":["S"],"price":4995,"compare_at_price":9990,"available":true},{"id":2,"options":["M"],"price":4995,"compare_at_price":9990,"available":true},{"id":3,"options":["L"],"price":5495,"compare_at_price":9990,"available":false}]</script>
            <span id="slv-adv-config" data-money-format="${{amount}}" data-cta="__CTA__" hidden></span>
          </div>
        </div>
      </div>
    </div>
"""

HEAD = """<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Advertorial preview</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>body { margin: 0; }</style>
</head><body>
"""


def assigned(source, name, fallback):
    found = re.search(r"assign\s+%s\s*=\s*'([^']*)'" % name, source)
    return found.group(1) if found else fallback


def build(source):
    heading = re.search(r'class="slv-adv__product-heading">(.*?)</h2>', source, re.S)
    desc = re.search(r'class="slv-adv__desc">(.*?)</div>', source, re.S)
    # read every assign before the Liquid tags get stripped below
    cta = assigned(source, "adv_cta_text", "BUY NOW")
    logo = assigned(source, "adv_logo", "")
    logo_alt = assigned(source, "adv_logo_alt", "Brand")

    stub = (PRODUCT_STUB
            .replace("__HEADING__", heading.group(1).strip() if heading else "PRODUCT")
            .replace("__DESC__", re.sub(r"\{\{.*?\}\}", "Product", desc.group(1).strip()) if desc else "")
            .replace("__REVIEWS__", assigned(source, "adv_review_count", "1349"))
            .replace("__DEAL__", assigned(source, "adv_deal_label", "LIMITED-TIME DEAL"))
            .replace("__CTA__", cta)
            .replace("__IMG__", STUB_IMAGE))

    start = source.find("{%- if adv_product == blank")
    end = source.find("  <!-- ===================== BOTTOM CTA")
    if start == -1 or end == -1:
        sys.exit("Could not locate the product block. Was this file built from the template?")
    source = source[:start] + stub + source[end:]

    source = re.sub(r"\{%-?\s*comment.*?endcomment\s*-?%\}", "", source, flags=re.S)
    source = re.sub(r"\{%.*?%\}", "", source, flags=re.S)
    source = source.replace("{{ adv_logo }}", logo)
    source = source.replace("{{ adv_logo_alt }}", logo_alt)
    source = source.replace("{{ adv_cta_text }}", cta)
    source = re.sub(r"\{\{(?!\s*amount).*?\}\}", "", source)
    return HEAD + source + "\n</body></html>\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("liquid", help="the advertorial .liquid file")
    parser.add_argument("-o", "--out", help="output path (default: <name>.preview.html)")
    args = parser.parse_args()

    source_path = pathlib.Path(args.liquid)
    out_path = pathlib.Path(args.out) if args.out else source_path.with_suffix(".preview.html")
    out_path.write_text(build(source_path.read_text()))
    print("Preview written to %s" % out_path)
    print("The product block is a stand-in — check layout and copy here, then verify the")
    print("real product on the published Shopify page.")


if __name__ == "__main__":
    main()
