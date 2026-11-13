"use client";

import { useEffect, useState } from "react";

import {
  getNewArrivals,
  getProductCategories,
} from "@/app/service/dataService";
import { loadAllProducts } from "@/app/service/productLinks";

import type { Product, Category } from "@/app/service/dataService";
import PageSection from "@/app/components/page-section/page-section";
import { Container } from "@/app/components/container/Container";
import PageTitle from "@/app/components/pageTitle/page-title";
import ShopByTheme from "@/app/components/shopByTheme/shopBytheme";
import Products from "@/app/components/products/Prodcuts";
import Loading from "@/app/components/loading/loading";

export default function HomeProductSections() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      setLoading(true);
      setError("");

      try {
        const [newArrivalsData, collectionsData, categoriesData] =
          await Promise.all([
            getNewArrivals(),
            loadAllProducts(),
            getProductCategories(),
          ]);

        if (!isMounted) return;

        setNewArrivals(Array.isArray(newArrivalsData) ? newArrivalsData : []);
        setCollections(Array.isArray(collectionsData) ? collectionsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error("[Home page data error]:", err);

        if (isMounted) {
          setError("Unable to load products. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <>
        <PageSection className="page-section-newarrivals">
          <Container>
            <PageTitle
              showAllHref="/products/collections?category=NewArrivals"
              title="New Arrivals"
              subtitle="Freshly added masterpieces for your sacred space."
            />
            <Loading type="section" message="Loading New Arrivals..." />
          </Container>
        </PageSection>

        <PageSection className="page-section-collection">
          <Container>
            <PageTitle
              showAllHref="/products/collections"
              label="Explore our"
              title="Collections"
              subtitle="Discover a timeless collection of divine sculptures, crafted with tradition and devotion"
            />
            <Loading type="section" message="Loading Collections..." />
          </Container>
        </PageSection>

        <PageSection className="page-section-our-theme">
          <Container>
            <PageTitle
              showAllHref="/products/collections"
              label="Our customers"
              title="Shop By Theme"
              subtitle="Shop by your favorite theme"
            />
            <Loading type="section" message="Loading categories..." />
          </Container>
        </PageSection>
      </>
    );
  }

  if (error) {
    return (
      <PageSection className="page-section-newarrivals">
        <Container>
          <p role="alert">{error}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </Container>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection className="page-section-newarrivals">
        <Container>
          <PageTitle
            showAllHref="/products/collections?category=NewArrivals"
            title="New Arrivals"
            subtitle="Freshly added masterpieces for your sacred space."
          />

          <Products data={newArrivals} />
        </Container>
      </PageSection>

      <PageSection className="page-section-collection">
        <Container>
          <PageTitle
            showAllHref="/products/collections"
            label="Explore our"
            title="Collections"
            subtitle="Discover a timeless collection of divine sculptures, crafted with tradition and devotion"
          />

          <Products
            data={collections.filter((item) => item.new_arrivals !== "1")}
          />
        </Container>
      </PageSection>

      <PageSection className="page-section-our-theme">
        <Container>
          <PageTitle
            showAllHref="/products/collections"
            label="Our customers"
            title="Shop By Theme"
            subtitle="Shop by your favorite theme"
          />

          <ShopByTheme data={categories} />
        </Container>
      </PageSection>
    </>
  );
}