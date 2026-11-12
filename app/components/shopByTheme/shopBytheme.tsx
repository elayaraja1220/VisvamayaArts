"use client";

import Link from "next/link";
import "./shop-by-theme.css";
import Typography from "../typegrophy/typography";
import type { Category } from "../../service/dataService";
import Button from "../button/button";
import { getProductImageUrl } from "@/app/service/imageSerive";

type ShopByThemeProps = {
  data: Category[];
  initialLimit?: number;
};

const PLACEHOLDER = "/images/products/product-placeholder.svg";

export default function ShopByTheme({
  data,
  initialLimit = 5,
}: ShopByThemeProps) {
  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center">
        <Typography variant="body">
          No categories available at the moment.
        </Typography>
      </div>
    );
  }

  const visibleCategories = data.slice(0, initialLimit);

  return (
    <div className="shop-by-theme-box">
      {visibleCategories.map((item) => {
        const rawImage = item.product_category_image;
        const imageUrl = rawImage ? getProductImageUrl(rawImage) : "";

        return (
          <div
            className={`shop-by-theme-col shop-by-bg-image-${item.product_category_id} ${
              imageUrl ? "" : "no-image-col"
            }`}
            key={item.product_category_id}
          >
            <Link
              href={`/products/collections?category=${encodeURIComponent(
                item.product_category_id,
              )}`}
              className="shop-now-link-image"
            >
              <img
                src={imageUrl || PLACEHOLDER}
                alt={item.product_category_name}
                className={imageUrl ? "image-fluid" : "no-image"}
                onError={(event) => {
                  const img = event.currentTarget;

                  img.onerror = null;
                  img.src = PLACEHOLDER;
                  img.classList.remove("image-fluid");
                  img.classList.add("no-image");
                  img.closest(".shop-by-theme-col")?.classList.add(
                    "no-image-col",
                  );
                }}
              />

              <div className="theme-overlay">
                <div className="theme-content">
                  <Typography variant="h4" className="theme-title">
                    {item.product_category_name}
                  </Typography>

                  <Typography variant="small" className="theme-subtitle">
                    {item.product_category_name}
                  </Typography>
                </div>

                <Button curve="full" color="primary" className="shop-now-btn">
                  <span className="hide-right">Shop now</span> &rarr;
                </Button>
              </div>

              <div className="prodcut-overlay-box"></div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}