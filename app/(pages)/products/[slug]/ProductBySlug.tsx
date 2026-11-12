"use client";

import { useEffect, useState } from "react";

import { loadProductSlugMaps } from "@/app/service/productLinks";
import Loading from "@/app/components/loading/loading";
import ProductNotFound from "@/app/components/product-not-found/productNotFound";
import ProductDetailsClient from "./ProductDetailsClient";

type State =
  | { status: "loading" }
  | { status: "found"; id: string }
  | { status: "missing" };

export default function ProductBySlug() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function resolve() {
      // The real product URL, e.g. /products/murugan/
      const parts = window.location.pathname.split("/").filter(Boolean);

      let slug = "";
      try {
        slug = decodeURIComponent(parts[parts.length - 1] ?? "");
      } catch {
        // malformed URL -> not found
      }

      let id: string | undefined;
      try {
        const { slugToId } = await loadProductSlugMaps();
        id = slugToId.get(slug);
      } catch {
        // API unavailable -> not found
      }

      if (!active) return;
      setState(id ? { status: "found", id } : { status: "missing" });
    }

    void resolve();

    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") {
    return <Loading type="section" message="Loading product details..." />;
  }

  if (state.status === "missing") {
    return <ProductNotFound primaryHref="/products/collections" />;
  }

  return <ProductDetailsClient id={state.id} />;
}
