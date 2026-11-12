"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import feather from "feather-icons";

import Button from "../button/button";
import QuantityControl from "../quantity-control/quantityControl";
import { useCart } from "@/app/context/cartContext";
import type { Product } from "../../service/dataService";
import { useToast } from "@/app/components/overlays/toast/toast";
import { toastMessages } from "@/app/constants/toastMessage";
import "./productActions.css";
import { ShoppingBag, ShoppingCart } from "react-feather";

const heartIcon =
  feather.icons.heart.toSvg({
    width: 20,
    height: 20,
    "stroke-width": 1.8,
  });

export default function ProductActions({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const [isMounted, setIsMounted] = useState(true);
 
const { toast } = useToast();
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartItem = isMounted
    ? items.find(
        (i) => i.product.product_id === product.product_id
      )
    : null;

  const quantity = cartItem?.quantity ?? 0;



  const handleBuyNow = () => {
    if (quantity === 0) {
      
      addToCart(product);
    toast(toastMessages.cart.added(product.product_name));

    }

    router.push("/checkout");
  };

  const handleWishlist = () => {
    // Add wishlist functionality here.
    console.log("Wishlist product:", product.product_id);
  };
 const isHideNow = useState(true);
  return (
    <div className="product-actions">
      <QuantityControl
        quantity={quantity}
        productName={product.product_name}
        productId={product.product_id}
  product={product}
      />

      <div className="product-actions-buttons">
        <Button
          variant="filled"
          color="secondary"
          curve="full"
          size="large"
          onClick={(e) => {
    e.preventDefault();

    addToCart(product);

    toast(
      toastMessages.cart.added(product.product_name)
    );
  }}
          
        >
          
  <ShoppingCart />
          <span className="hide-mobile-ipad">Add to Cart</span>
        </Button>

        <Button
          variant="filled"
          color="secondary"
          curve="full"
          size="large"
          onClick={handleBuyNow}
        >
        <ShoppingBag /> <span className="hide-mobile-ipad"> Buy Now </span>
        </Button>
{
  !isHideNow &&

        <Button
          variant="circle"
          color="secondary"
          curve="none"
          size="large"
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <span
            className="product-heart-icon"
            aria-hidden="true"
            dangerouslySetInnerHTML={{
              __html: heartIcon,
            }}
          />
        </Button>
}
      </div>
    </div>
  );
}