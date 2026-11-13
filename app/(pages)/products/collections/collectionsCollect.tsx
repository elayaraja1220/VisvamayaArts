"use client";

import { useEffect, useMemo, useState } from "react";

import BackTitle from "@/app/components/backTitle/backTitle";
import Breadcrumb from "@/app/components/breadcrumbs/breadcrumb";
import Products from "@/app/components/products/Prodcuts";
import type { Category, Product } from "@/app/service/dataService";
import { Container } from "@/app/components/container/Container";
import { Tabs } from "@/app/components/tabs";
import Autocomplete from "@/app/components/forms/autocomplete";
import { productMatchesCategory } from "@/app/utils/productCategory";
import "./collectionsCollect.css";
import { FormSelect } from "@/app/components/forms";
import PageSection from "@/app/components/page-section/page-section";

const ALL = "all";
const NewArrivals = "NewArrivals";

type CollectionsCollectProps = {
  categories: Category[];
  products: Product[];
  initialCategoryId?: string;
};

type SortOrder = "default" | "lowtohigh" | "hightolow" | "A-Z" | "Z-A";

const byOrder = (
  a: { display_order?: string },
  b: { display_order?: string },
) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0);

export default function CollectionsCollect({
  categories,
  products,
  initialCategoryId = ALL,
}: CollectionsCollectProps) {
  const [activeId, setActiveId] = useState<string>(initialCategoryId);
  const [query, setQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    setActiveId(initialCategoryId || ALL);
    setSelectedProductId(null);
    setQuery("");
  }, [initialCategoryId]);

  const visibleCategories = useMemo(
    () =>
      categories
        .filter(
          (category) =>
            String(category.is_active ?? "1") !== "0" &&
            String(category.display_category ?? "1") !== "0",
        )
        .sort(byOrder),
    [categories],
  );

  const visibleProducts = useMemo(
    () =>
      products
        .filter((product) => product.product_id != null)
        .sort((a, b) => Number(b.product_id) - Number(a.product_id)),
    [products],
  );

  const categoryOptions = useMemo(
    () => [
      { value: "default", label: "All" },
      { value: "lowtohigh", label: "Price: Low to High" },
      { value: "hightolow", label: "Price: High to Low" },
      { value: "A-Z", label: "Name: A to Z" },
      { value: "Z-A", label: "Name: Z to A" },
    ],
    [],
  );

  const getProductPrice = (price: Product["product_price"]) => {
    const parsedPrice = Number(String(price ?? "0").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsedPrice) ? parsedPrice : 0;
  };

  const sortProducts = (productsToSort: Product[]): Product[] => {
    const sortedProducts = [...productsToSort];

    switch (sortOrder) {
      case "lowtohigh":
        return sortedProducts.sort(
          (a, b) =>
            getProductPrice(a.product_price) - getProductPrice(b.product_price),
        );

      case "hightolow":
        return sortedProducts.sort(
          (a, b) =>
            getProductPrice(b.product_price) - getProductPrice(a.product_price),
        );

      case "A-Z":
        return sortedProducts.sort((a, b) =>
          (a.product_name ?? "").localeCompare(b.product_name ?? ""),
        );

      case "Z-A":
        return sortedProducts.sort((a, b) =>
          (b.product_name ?? "").localeCompare(a.product_name ?? ""),
        );

      default:
        return sortedProducts;
    }
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setSelectedProductId(null);
  };

  const handleProductSelect = (
    value: string | number | null | (string | number)[],
  ) => {
    if (Array.isArray(value)) return;

    if (value == null || value === "") {
      setSelectedProductId(null);
      setQuery("");
      return;
    }

    const productId = String(value);

    const selectedProduct = visibleProducts.find(
      (product) => String(product.product_id) === productId,
    );

    if (!selectedProduct) return;

    setSelectedProductId(productId);
    setQuery(selectedProduct.product_name ?? "");

    if (selectedProduct.product_category_id != null) {
      setActiveId(String(selectedProduct.product_category_id));
    }
  };

  const selectCategory = (categoryId: string) => {
    setActiveId(categoryId);
    setSelectedProductId(null);
  };

  const getProductsForCategory = (categoryId: string) => {
    const searchQuery = query.trim().toLowerCase();
    const shouldSearch = searchQuery.length >= 3;

    const filteredProducts = visibleProducts.filter((product) => {
      const matchesCategory =
        categoryId === ALL ||
        (categoryId === NewArrivals
          ? String(product.new_arrivals) === "1"
          : productMatchesCategory(product.product_category_id, categoryId));

      const categoryNames = Array.isArray(product.product_category_name)
        ? product.product_category_name.join(" ")
        : (product.product_category_name ?? "");

      const matchesSearch =
        !shouldSearch ||
        (product.product_name ?? "").toLowerCase().includes(searchQuery) ||
        categoryNames.toLowerCase().includes(searchQuery);

      const matchesSelectedProduct =
        !selectedProductId || String(product.product_id) === selectedProductId;

      return matchesCategory && matchesSearch && matchesSelectedProduct;
    });

    if (categoryId === ALL && sortOrder === "default") {
      return filteredProducts.sort((a, b) => {
        const aIsNew = String(a.new_arrivals) === "1";
        const bIsNew = String(b.new_arrivals) === "1";

        if (aIsNew && !bIsNew) return -1;
        if (!aIsNew && bIsNew) return 1;

        return Number(b.product_id) - Number(a.product_id);
      });
    }

    return sortProducts(filteredProducts);
  };

  const tabItems = useMemo(() => {
    const tabCategories = [
      { id: ALL, label: "All" },
      { id: NewArrivals, label: "New Arrivals" },
      ...visibleCategories.map((category) => ({
        id: String(category.product_category_id),
        label: category.product_category_name,
      })),
    ];

    return tabCategories.map((category) => ({
      id: category.id,
      label: category.label,
      content: (
        <div className="collections-tab-content">
          {(() => {
            const categoryProducts = getProductsForCategory(category.id);

            return categoryProducts.length > 0 ? (
              <Products data={categoryProducts} variant="grid" />
            ) : (
              <div className="collections-empty-state" role="status">
                <p>No products found.</p>
              </div>
            );
          })()}
        </div>
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    visibleCategories,
    visibleProducts,
    query,
    selectedProductId,
    sortOrder,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 116);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <PageSection className="fiter-section">
        <Container>
          <div className="page-title-filter-container">
            <div>
              <BackTitle
                title={`Collections | ${
                  activeId === ALL
                    ? "All"
                    : activeId === NewArrivals
                      ? "New Arrivals"
                      : (visibleCategories.find(
                          (category) =>
                            String(category.product_category_id) === activeId,
                        )?.product_category_name ?? "All")
                }`}
              />

              <Breadcrumb
                items={[
                  { label: "Home", href: "/" },
                  { label: "Collections", href: "/products/collections" },
                ]}
              />
            </div>

            <div className="collections-search">
              <Autocomplete<Product>
                id="collections-product-search"
                placeholder="Search products..."
                options={visibleProducts}
                getOptionLabel={(product) => product.product_name ?? ""}
                getOptionValue={(product) => String(product.product_id)}
                value={selectedProductId}
                inputValue={query}
                onInputChange={handleSearchChange}
                onChange={handleProductSelect}
                minQueryLength={3}
                multiple={false}
                clearable
                openOnFocus
                emptyMessage="No matching products found."
                noOptionsMessage="Type at least 3 characters to search."
                renderOption={(product) => (
                  <div className="flex flex-col">
                    <span className="font-medium">{product.product_name}</span>
                    <span className="text-xs text-slate-500">
                      {product.product_category_name}
                    </span>
                  </div>
                )}
              />

              <FormSelect
                id="collections-sort"
                name="sort"
                variant="filled"
                size="medium"
                curve="medium"
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value as SortOrder)
                }
                options={categoryOptions}
                placeholder=""
              />
            </div>
          </div>
        </Container>
      </PageSection>

      <PageSection className="collections-page">
        <Container>
          <div
            className={`collections-category-tabs ${scroll ? "sticky" : ""}`}
          >
            <Tabs
              tabs={tabItems}
              activeTab={activeId}
              onChange={selectCategory}
              variant="outline"
              radius="full"
              size="medium"
              theme="white"
            />
          </div>
        </Container>
      </PageSection>
    </>
  );
}