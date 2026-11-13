"use client";

import { useEffect, useState } from "react";

import Products from "@/app/components/products/Prodcuts";
import PageTitle from "@/app/components/pageTitle/page-title";

import {
  getProductsByCategory,
  type Product,
} from "@/app/service/dataService";

import PageSection from "../page-section/page-section";
import { Container } from "../container/Container";

type Props = {
  categoryId: string | number;
  currentProductId: string;
  limit?: number;
};

export default function SimilarProducts({
  categoryId,
  currentProductId,
  limit = 4,
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSimilarProducts() {
      try {
        setLoading(true);

        const data = await getProductsByCategory(categoryId);

        if (!active) return;

        const similarProducts = data
          .filter(
            (product) =>
              String(product.product_id) !==
              String(currentProductId)
          )
          .slice(0, limit);

        setProducts(similarProducts);
      } catch (error) {
        console.error(
          "Failed to load similar products:",
          error
        );

        if (active) {
          setProducts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSimilarProducts();

    return () => {
      active = false;
    };
  }, [categoryId, currentProductId, limit]);

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <PageSection className="products-section-similar">
      <Container>
        <PageTitle title="Similar Products" />

        <Products data={products} />
      </Container>
    </PageSection>
  );
}
