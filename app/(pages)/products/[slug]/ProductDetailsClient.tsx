
"use client";

import { useEffect, useState } from "react";

import PageSection from "@/app/components/page-section/page-section";
import { Container } from "@/app/components/container/Container";
import Typography from "@/app/components/typegrophy/typography";

import {
  getProductById,
  getProductCategories,
  type Product,
  type Category,
} from "@/app/service/dataService";

import { getProductImageUrl } from "@/app/service/imageSerive";
import { Card } from "@/app/components/card/card";

import "./products-details.css";

import CustomerCare from "@/app/components/customercare/customerCare";
import { Tabs } from "@/app/components/tabs";
import type { TabItem } from "@/app/components/tabs";

import TrackRecentlyViewed from "@/app/components/recently-viewed/TrackRecentlyViewed";
import RecentlyViewedProducts from "@/app/components/recently-viewed/RecentlyViewedProducts";
import SimilarProducts from "@/app/components/similar-products/similarProducts";

import ProductActions from "@/app/components/products/ProductActions";
import GiftOptions from "@/app/components/addGift/addGift";

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@/app/components/accordion";

import ActionListIcons from "@/app/components/actions-icons-list/actionsIconsList";
import BackTitle from "@/app/components/backTitle/backTitle";

import useMediaQuery from "@/app/utils/useMediaQuery";
import { breakpoints } from "@/app/utils/breakpoints";
import Loading from "@/app/components/loading/loading";
import ProductNotFound from "@/app/components/product-not-found/productNotFound";

type Props = {
  id: string;
};

export default function ProductDetailsClient({ id }: Props) {
  // Responsive breakpoints
  const isMobile = useMediaQuery(breakpoints.mobile);
  const isIpadSmall = useMediaQuery(breakpoints.ipadSmall);
  const isIpad = useMediaQuery(breakpoints.ipad);
  const isDesktop = useMediaQuery(breakpoints.desktop);

  // Component state
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const ishideNow = useState(true);

  // Load product details
  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const [productData, categoryData] = await Promise.all([
          getProductById(id),
          getProductCategories(),
        ]);

        if (!active) return;

        setProduct(productData);
        setCategories(categoryData);

        if (!productData) {
          setError("Product not found.");
        }
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load product."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <Loading message="Loading product details..." type="section" />
    );
  }

  // Error state
  if (error || !product) {
    return (
       <ProductNotFound primaryHref="/products/collections"
/>

    );
  }

  // Product category
  const categoryName =
    categories.find(
      (category) =>
        String(category.product_category_id) ===
        String(product.product_category_id)
    )?.product_category_name ?? "";

  // Product specifications
  const specifications = (
    product.product_dimension_detailed ?? ""
  )
    .replace(/<[^>]*>/g, " ")
    .split(
      /(?=Weight\s*:|Material\s*:|Height\s*:|Wight\s*)/i
    )
    .map((item) => item.trim())
    .filter(Boolean);

  // Product detail tabs
  const tabs: TabItem[] = [
    {
      id: "description",
      label: "Description",
      content: (
        <Typography>
          {product.product_description_detailed}
        </Typography>
      ),
    },
    {
      id: "reviews",
      label: "Customer Reviews",
      content: (
        <p>
          Customer ratings and reviews will appear here.
        </p>
      ),
    },
    {
      id: "faqs",
      label: "FAQ's",
      content: (
        <p>
          Frequently asked questions will appear here.
        </p>
      ),
    },
    {
      id: "shipping",
      label: "Shipping & Delivery",
      content: (
        <p>
          Shipping charges, delivery times, and return information.
        </p>
      ),
    },
  ];

  // Show product detail accordion on mobile and small iPad only
  const showProductAccordion = !isDesktop; 
  

  return (
    <>
      {/* Recently Viewed Tracking */}
      <TrackRecentlyViewed
        productId={String(product.product_id)}
      />

      {/* Product Header */}
      <Container>
        <div className="products-detail-row">
          <div className="products-detali-left">
            <BackTitle
              title={product.product_name}
              subtitle={product.product_period}
            />
          </div>

          <div className="product-details-right">
            <ActionListIcons
              title={product.product_name}
              audio={product.product_audio_file}
              youtube={product.product_youtube_url}
              facebook={product.product_facebook_url}
              instagram={product.product_instagram_url}
            />
          </div>
        </div>
      </Container>

      {/* Product Details */}
      <PageSection className="page-section-product-details page-section-bg-color-secondary">
        <Container>
          <Card className="prodcut-details-card">
            <div className="products-details-row">

              {/* Product Image */}
              <div className="product-details-image-box">
                <img
                  src={getProductImageUrl(product.product_image)}
                  alt={product.product_name}
                  className="product-details-image"
                />

                {/* Desktop Product Tabs */}
                {isDesktop && (
                  <div className="product-details-tabs">
                    <Tabs
                      tabs={tabs}
                      theme="secondary"
                      size="large"
                      defaultActiveTab="description"
                      variant="bordered"
                    />
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="products-details-content">

                {/* Product Description */}
                {!isMobile && !isIpadSmall && (
                  <>
                    {product.product_description_heading && (
                      <Typography
                        variant="h6"
                        as="span"
                      >
                        {product.product_description_heading}
                      </Typography>
                    )}

                    <Typography variant="small">
                      {product.product_description}
                    </Typography>
                  </>
                )}

                {/* Product Price */}
                <div>
                  <Typography
                    variant="h1"
                    as="h1"
                    className="product-details-price"
                  >
                    ₹{product.product_price} /-
                  </Typography>

                  <Typography className="text-gst">
                    Including GST
                  </Typography>
                </div>

                {/* Product Actions */}
                <ProductActions product={product} />

                {/* Gift Options */}
                {/* {ishideNow && <GiftOptions />} */}

                {/* Product Dimensions */}
                <div className="section-dimension">

                  <Accordion
                    theme="primary"
                    size="medium"
                    mode="multiple"
                    defaultOpenIds={[
                      "dimensions",
                      "needHelp",
                    ]}
                  >
                    {/* Dimensions */}
                    <AccordionItem id="dimensions">
                      <AccordionHeader>
                        Dimensions
                      </AccordionHeader>

                      <AccordionContent>
                        {specifications.map((item, index) => {
                          const [label, ...rest] = item.split(":");

                          return (
                            <Typography
                              key={index}
                              variant="small"
                            >
                              {label.trim()}:{" "}
                              <strong>
                                {rest.join(":").trim()}
                              </strong>
                            </Typography>
                          );
                        })}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Need Help */}
                    <AccordionItem id="needHelp">
                      <AccordionHeader>
                        Need Help?
                      </AccordionHeader>

                      <AccordionContent>
                        <CustomerCare
                          variant="vertical"
                          background="transparent"
                          isShowWhatsApp={true}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Mobile and Small iPad Product Accordion */}
                  {showProductAccordion && (
                    <div className="product-details-accordion">
                      <Accordion
                        theme="primary"
                        size="medium"
                        mode="multiple"
                        defaultOpenIds={["description"]}
                      >
                        {tabs.map((tab) => (
                          <AccordionItem
                            key={tab.id}
                            id={tab.id}
                          >
                            <AccordionHeader>
                              {tab.label}
                            </AccordionHeader>

                            <AccordionContent>
                              {tab.content}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </Card>
        </Container>
      </PageSection>

      {/* Similar Products */}
      <SimilarProducts
        categoryId={String(product.product_category_id)}
        currentProductId={String(product.product_id)}
      />

      {/* Recently Viewed Products */}
      <PageSection className="page-section-viewed">
        <Container>
          <RecentlyViewedProducts
            currentProductId={String(product.product_id)}
            title="Recently Viewed"
          />
        </Container>
      </PageSection>
    </>
  );
}
