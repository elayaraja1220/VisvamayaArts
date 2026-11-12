"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

import {
  getProductCategories,
  type Category,
  type Product,
} from "@/app/service/dataService";
import { loadAllProducts } from "@/app/service/productLinks";
import CollectionsCollect from "@/app/(pages)/products/collections/collectionsCollect";

type Props = {
  // Shown while products and categories load
  fallback: ReactNode;
};

export default function ProductCollection({ fallback }: Props) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Load the latest products and categories from the API
  useEffect(() => {
    let active = true;

    Promise.all([loadAllProducts(), getProductCategories()])
      .then(([productData, categoryData]) => {
        if (!active) return;
        setProducts(productData);
        setCategories(categoryData);
      })
      .catch((error) => {
        console.error("[Collections] Unable to load products:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <>{fallback}</>;

  return (
    <CollectionsCollect
      categories={categories}
      products={products}
      initialCategoryId={categoryParam}
    />
  );
}
