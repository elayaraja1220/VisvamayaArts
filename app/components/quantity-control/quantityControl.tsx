"use client";

import "./quantityControl.css";

import { useCart } from "@/app/context/cartContext";
import { useToast } from "@/app/components/overlays/toast/toast";
import { toastMessages } from "@/app/constants/toastMessage";

import type { Product } from "@/app/service/dataService";

type QuantityControlProps = {
  quantity: number;
  productName: string;
  productId: string;
  product?: Product;
};

export default function QuantityControl({
  quantity,
  productName,
  productId,
  product,
}: QuantityControlProps) {
  const {
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const { toast } = useToast();

  // Increase quantity
  const handleIncrease = () => {
    if (!product) return;

    addToCart(product);

    toast(
      toastMessages.cart.added(productName)
    );
  };

  // Decrease quantity
  const handleDecrease = () => {
    if (quantity <= 0) return;

    if (quantity === 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(
        productId,
        quantity - 1
      );
    }

    toast(
      toastMessages.cart.removed(productName)
    );
  };

  return (
    <div className="quantity-control">

      <button
        type="button"
        className="quantity-btn"
        aria-label={`Decrease ${productName} quantity`}
        onClick={handleDecrease}
      >
        −
      </button>

      <span
        className="quantity-value"
        aria-live="polite"
      >
        {quantity}
      </span>

      <button
        type="button"
        className="quantity-btn"
        aria-label={`Increase ${productName} quantity`}
        onClick={handleIncrease}
      >
        +
      </button>

    </div>
  );
}