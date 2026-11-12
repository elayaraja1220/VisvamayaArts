"use client";

import { useState, useEffect, useRef } from "react";

import Button from "../button/button";
import Typography from "../typegrophy/typography";
import type { Product } from "../../service/dataService";
import "./prodcut.css";

import { useCart } from "@/app/context/cartContext";
import QuantityControl from "../quantity-control/quantityControl";
import { getProductImageUrl } from "@/app/service/imageSerive";
import { useToast } from "@/app/components/overlays/toast/toast";
import { toastMessages } from "@/app/constants/toastMessage";
import { productHref, useProductSlugs } from "@/app/service/productLinks";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "react-feather";

import "swiper/css";

type ProductsProps = {
  data: Product[];
  variant?: "slide" | "grid";
};

export default function Products({
  data,
  variant = "slide",
}: ProductsProps) {
  // product_id -> unique slug, worked out live from the current product list
  const slugs = useProductSlugs();
  const { items, addToCart } = useCart();
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateNavigation = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  if (!data || data.length === 0) {
    return (
      <div>
        <Typography variant="body">
          No products available at the moment.
        </Typography>
      </div>
    );
  }

  // Shared card markup used by both slide and grid variants
  const renderCard = (item: Product) => {
    const cartItem = isMounted
      ? items.find((c) => c.product.product_id === item.product_id)
      : null;

    const quantity = cartItem?.quantity ?? 0;

    return (
      <div className="product-card">
        {/* Product Image and Details.
            Plain <a>: product pages are served by .htaccess, so a full page
            load is required (no Next.js prefetch of non-existent files). */}
        <a href={productHref(item, slugs)} className="product-top">
          <div className="product-image-box">
            {item.new_arrivals === "1" && (
              <span className="product-badge">New</span>
            )}

            <img
              src={getProductImageUrl(item.product_image)}
              alt={item.product_name}
              className="product-image"
              loading="lazy"
            />
          </div>

          <div className="product-content-box">
            <div className="product-name">
              <Typography variant="h6" className="font-weight-semibold">
                {item.product_name}
              </Typography>
            </div>

            <div className="prodcut-meta">
              <Typography variant="small" as="span">
                {item.product_dimension}
              </Typography>
            </div>
          </div>

          <div className="prodcut-overlay-box" />
        </a>

        {/* Product Price and Cart */}
        <div className="product-details">
          <div className="product-details-left">
            <Typography as="h6" className="product-price">
              ₹{item.product_price} /-
            </Typography>
            <Typography className="text-gst">Including GST</Typography>
          </div>

          <div className="product-details-right">
            {quantity === 0 ? (
              <Button
                curve="full"
                size="small"
                color="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  addToCart(item);
                  toast(toastMessages.cart.added(item.product_name));
                }}
              >
                Add Cart
              </Button>
            ) : (
              <QuantityControl
                quantity={quantity}
                productName={item.product_name}
                productId={item.product_id}
                product={item}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ---------- GRID VARIANT (no Swiper) ---------- */
  if (variant === "grid") {
    return (
      <div className="products-grid">
        {data.map((item) => (
          <div className="products-grid-item" key={item.product_id}>
            {renderCard(item)}
          </div>
        ))}
      </div>
    );
  }

  /* ---------- SLIDE VARIANT (default) ---------- */
  return (
    <div className="products-slider">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          updateNavigation(swiper);
        }}
        onSlideChange={updateNavigation}
        onResize={updateNavigation}
        slidesPerView={4}
        slidesPerGroup={1}
        spaceBetween={20}
        speed={500}
        loop={false}
        watchOverflow
        breakpoints={{
          320: { slidesPerView: 1.25, slidesPerGroup: 1, spaceBetween: 15 },
          567: { slidesPerView: 1.25, slidesPerGroup: 1, spaceBetween: 15 },
          768: { slidesPerView: 2.25, slidesPerGroup: 1, spaceBetween: 15 },
          1024: { slidesPerView: 4, slidesPerGroup: 1 },
        }}
      >
        {data.map((item) => (
          <SwiperSlide key={item.product_id}>{renderCard(item)}</SwiperSlide>
        ))}
      </Swiper>

      <div className="products-arrrow-container">
        <Button
          type="button"
          variant="circle"
          size="medium"
          color="primary"
          onClick={() => swiperRef.current?.slidePrev()}
          disabled={isBeginning}
        >
          <ChevronLeft size={50} />
        </Button>
        <Button
          type="button"
          variant="circle"
          size="medium"
          color="primary"
          onClick={() => swiperRef.current?.slideNext()}
          disabled={isEnd}
        >
          <ChevronRight size={50} />
        </Button>
      </div>
    </div>
  );
}