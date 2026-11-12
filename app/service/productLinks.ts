// app/service/productLinks.ts
//
// Product URLs are worked out live in the browser from the current product
// list, so products added, renamed or deleted in the admin always link to
// the right page without rebuilding the site.

import { useEffect, useState } from "react";

import { getProductCollections, type Product } from "./dataService";
import { buildSlugMap, slugify } from "@/app/utils/slugify";

type SlugMaps = ReturnType<typeof buildSlugMap<Product>>;

// Reuse one product list per page for 5 minutes, so the home page,
// product cards and the product page don't each call the API.
const CACHE_MS = 5 * 60 * 1000;

let productsPromise: Promise<Product[]> | null = null;
let loadedAt = 0;

/** All products + new arrivals, newest first (cached briefly). */
export function loadAllProducts(): Promise<Product[]> {
  if (!productsPromise || Date.now() - loadedAt > CACHE_MS) {
    loadedAt = Date.now();
    productsPromise = getProductCollections().then((products) => {
      // The data service returns [] on API errors; don't cache that.
      if (products.length === 0) productsPromise = null;
      return products;
    });
  }

  return productsPromise;
}

/** product_id <-> unique slug maps, built the same way everywhere. */
export async function loadProductSlugMaps(): Promise<SlugMaps> {
  const products = await loadAllProducts();

  // Oldest first: the oldest product keeps the plain slug and later
  // products with the same name get "-<id>", so existing URLs stay stable.
  const oldestFirst = [...products].sort(
    (a, b) => Number(a.product_id) - Number(b.product_id),
  );

  return buildSlugMap(oldestFirst);
}

/** React hook: product_id -> slug (empty until the list has loaded). */
export function useProductSlugs(): Record<string, string> {
  const [slugs, setSlugs] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    loadProductSlugMaps()
      .then(({ idToSlug }) => {
        if (active) setSlugs(Object.fromEntries(idToSlug));
      })
      .catch(() => {
        // Links fall back to the plain product-name slug.
      });

    return () => {
      active = false;
    };
  }, []);

  return slugs;
}

/** URL of a product's page. */
export function productHref(
  product: Pick<Product, "product_id" | "product_name">,
  slugs: Record<string, string>,
): string {
  const slug =
    slugs[String(product.product_id)] ??
    (slugify(product.product_name ?? "") || String(product.product_id));

  return `/products/${slug}/`;
}
