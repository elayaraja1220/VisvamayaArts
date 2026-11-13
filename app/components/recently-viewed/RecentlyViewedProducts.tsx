"use client";

import { useEffect, useState } from "react";

import {
  getProductById,
  type Product,
} from "@/app/service/dataService";

import { getRecentlyViewedIds } from "@/app/service/recentlyViewedService";
import Products from "../products/Prodcuts";
import PageTitle from "../pageTitle/page-title";

type Props = {
  currentProductId: string;
  title?: string;
};

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    return await getProductById(id);
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return null;
  }
}

export default function RecentlyViewedProducts({
  currentProductId,
  title = "Recently Viewed",
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);

      const ids = getRecentlyViewedIds().filter(
        (id) => String(id) !== String(currentProductId),
      );

      const results = await Promise.all(ids.map(fetchProduct));

      if (cancelled) return;

      setProducts(results.filter((product): product is Product => product !== null));
      setLoading(false);
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [currentProductId]);

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="recently-viewed">
      <PageTitle  title={title} />
      <Products data={products} />
    </section>
  );
}