"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useCart } from "@/app/context/cartContext";
import { getProductImageUrl } from "@/app/service/imageSerive";

import "./viewCart.css";

import Button from "@/app/components/button/button";
import Typography from "../typegrophy/typography";
import QuantityControl from "../quantity-control/quantityControl";
import { Card } from "../card/card";

import { calculateOrderTotals } from "@/app/utils/gstcalculation";
import { productHref, useProductSlugs } from "@/app/service/productLinks";
import { ShoppingCart } from "react-feather";

type ViewCartProps = {
  onCheckout?: () => void;
  onClose?: () => void;
  
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const parsePrice = (price: string | number | undefined) => {
  const parsed = Number(String(price ?? "").replace(/[₹,\s]/g, ""));

  return Number.isFinite(parsed) ? parsed : 0;
};

export default function ViewCart({ onCheckout, onClose }: ViewCartProps) {
  const router = useRouter();
  const slugs = useProductSlugs();

  const {
    items,
    hydrated,
    removeFromCart,
  } = useCart();

  const totalInclusive = items.reduce(
    (total, item) =>
      total +
      parsePrice(item.product.product_price) * item.quantity,
    0,
  );

  const {
    subtotal,
    gstPercentage,
    cgst_amount,
    sgst_amount,
    totalGST,
    grandTotal,
    totalItems,
  } = calculateOrderTotals(totalInclusive, items);

  if (!hydrated) {
    return (
      <div className="cart-loading" aria-live="polite">
        Loading your cart...
      </div>
    );
  }

  if (items.length === 0) {
  return (
    <div className="cart-empty-container">
      <div className="cart-empty">

        <div className="cart-empty-icon">
          <img
            src="/images/cart/empty-cart.png"
            alt="Lord Ganesha"
          />
        </div>

        <div className="cart-empty-content">

          <Typography
            variant="h4"
            className="cart-empty-title"
          >
            Your Cart is Empty
          </Typography>

          <Typography className="cart-empty-description">
            Looks like you haven&apos;t added anything
            to your cart yet.
          </Typography>

          <div className="cart-empty-divider">
            <span>❖</span>
          </div>

          <Button
            href="/products/collections/"
            size="large"
            variant="filled"
            color="secondary"
            curve="full"
            className="cart-empty-button"
            onClick={() => {
    onClose?.();
  }}

          >
            <span>Continue Shopping</span>
            <span className="cart-empty-arrow">→</span>
          </Button>

          <div className="cart-empty-blessing">
            <span className="cart-empty-diya">🪔</span>

            <p>
              Bring more positivity and blessings
              with our divine collection.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

  return (
    <div className="cart-layout">

      <section className="cart-items" aria-label="Cart items">
        <Card className="cart-item">
          {items.map(({ product, quantity }) => {
            const price = parsePrice(product.product_price);

            const imageUrl = getProductImageUrl(
              product.product_image,
            );

            return (
              <div
                className="cart-item-row"
                key={product.product_id}
              >
                <div className="cart-item-left">
                  <a
                    href={productHref(product, slugs)}
                    className="cart-item-image"
                    aria-label={`View ${product.product_name}`}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.product_name}
                      />
                    ) : (
                      <span className="cart-no-image">
                        No image
                      </span>
                    )}
                  </a>

                  <div className="cart-item-details">
                    <Typography
                      variant="h6"
                      className="cart-item-name"
                    >
                      {product.product_name}
                    </Typography>

                    <Typography className="cart-item-dimension">
                      {product.product_dimension}
                    </Typography>

                    <div className="cart-item-actions">
                      <QuantityControl
                        quantity={quantity}
                        productName={product.product_name}
                        productId={product.product_id}
                        product={product}
                      />

                      <div className="cart-item-remove-container">
                        <Button
                          variant="circle"
                          type="button"
                          size="small"
                          color="white"
                          className="cart-remove"
                          onClick={() =>
                            removeFromCart(product.product_id)
                          }
                        >
                          <img
                            src="/images/icons/svg/svg-remove.svg"
                            alt="remove-icon"
                          />
                        </Button>

                        <Typography>
                          ID: {product.product_id}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cart-item-price cart-item-right">
                  <Typography variant="h5">
                    {formatPrice(price * quantity)} /-
                  </Typography>
                </div>
              </div>
            );
          })}
        </Card>
      </section>

      <section className="cart-summary">
        <div className="cart-summary-total">
          <div className="cart-summary-flex">
            <Typography variant="h5" className="m-0">
              Subtotal <span>{totalItems}</span> Items
            </Typography>

            <Typography variant="h5" className="m-0">
              {formatPrice(subtotal)}
            </Typography>
          </div>

          <div className="cart-summary-flex">
            <Typography variant="h6">
              CGST
            </Typography>

            <Typography variant="h6">
              {formatPrice(cgst_amount)}
            </Typography>
          </div>

          <div className="cart-summary-flex">
            <Typography variant="h6">
              SGST
            </Typography>

            <Typography variant="h6">
              {formatPrice(sgst_amount)}
            </Typography>
          </div>
        </div>

        <div className="cart-summery-grand-total">
          <Typography variant="h4">
            Grand Total
          </Typography>

          <Typography variant="h3">
            {formatPrice(grandTotal)}
          </Typography>
        </div>

        <div className="checkout-button">
          <Button
            size="fullwidth"
            color="secondary"
            curve="full"
            onClick={() => {
              onCheckout?.();
              router.push("/checkout");
            }}
          >
            Checkout
          </Button>
        </div>
      </section>
    </div>
  );
}