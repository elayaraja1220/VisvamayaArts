import { useEffect, useState } from "react";

import { getProductCollections, type Product } from "./dataService";
import { buildSlugMap, slugify } from "@/app/utils/slugify";

type SlugMaps = ReturnType<typeof buildSlugMap<Product>>;

const CACHE_MS = 5 * 60 * 1000;

let productsPromise: Promise<Product[]> | null = null;
let loadedAt = 0;

export function loadAllProducts(): Promise<Product[]> {
  if (!productsPromise || Date.now() - loadedAt > CACHE_MS) {
    loadedAt = Date.now();
    productsPromise = getProductCollections().then((products) => {
      if (products.length === 0) productsPromise = null;
      return products;
    });
  }

  return productsPromise;
}

export async function loadProductSlugMaps(): Promise<SlugMaps> {
  const products = await loadAllProducts();

  const oldestFirst = [...products].sort(
    (a, b) => Number(a.product_id) - Number(b.product_id),
  );

  return buildSlugMap(oldestFirst);
}

export function useProductSlugs(): Record<string, string> {
  const [slugs, setSlugs] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    loadProductSlugMaps()
      .then(({ idToSlug }) => {
        if (active) setSlugs(Object.fromEntries(idToSlug));
      })
      .catch(() => {
      });

    return () => {
      active = false;
    };
  }, []);

  return slugs;
}

export function productHref(
  product: Pick<Product, "product_id" | "product_name">,
  slugs: Record<string, string>,
): string {
  const slug =
    slugs[String(product.product_id)] ??
    (slugify(product.product_name ?? "") || String(product.product_id));

  return `/products/${slug}/`;
}
