"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import ShippingAddress, {
  type ShippingAddressData,
  type CartOrderItem,
} from "@/app/components/shippingAddress/shippingAddress";

import PageSection from "@/app/components/page-section/page-section";
import { Container } from "@/app/components/container/Container";
import { useCart } from "@/app/context/cartContext";

import {
  redirectToPaymentGateway,
  type SubmitOrderPayload,
  type SubmitOrderProduct,
} from "@/app/service/checkoutService";

import { calculateOrderTotals } from "@/app/utils/gstcalculation";

import ConfirmationDialog, {
  type ConfirmationStatus,
} from "@/app/components/overlays/confirmation-dialog/confirmation-dialog";

import "./checkout.css";

const ADDRESS_STORAGE_KEY = "vismayam-shipping-addresses";
const SELECTED_ADDRESS_STORAGE_KEY =
  "vismayam-selected-shipping-address";

const parsePrice = (
  price: string | number | undefined,
): number => {
  const parsed = Number(
    String(price ?? "").replace(/[₹,\s]/g, ""),
  );

  return Number.isFinite(parsed) ? parsed : 0;
};

export default function Checkout() {
  const { items, hydrated } = useCart();

  const [addresses, setAddresses] =
    useState<ShippingAddressData[]>([]);

  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  const [addressLoaded, setAddressLoaded] = useState(false);

  const [isSubmittingOrder, setIsSubmittingOrder] =
    useState(false);

  const [orderMessage, setOrderMessage] = useState("");

  const [pendingAddress, setPendingAddress] =
    useState<ShippingAddressData | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);

  const [dialogStatus, setDialogStatus] =
    useState<ConfirmationStatus>("inprogress");

  const [dialogTitle, setDialogTitle] = useState("");

  const [dialogDescription, setDialogDescription] =
    useState("");

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedAddresses =
          localStorage.getItem(ADDRESS_STORAGE_KEY);

        const savedSelectedAddressId =
          localStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);

        if (savedAddresses) {
          const parsed: unknown = JSON.parse(savedAddresses);

          if (Array.isArray(parsed)) {
            const validAddresses = parsed.filter(
              (item): item is ShippingAddressData =>
                item !== null &&
                typeof item === "object" &&
                typeof item.id === "string" &&
                typeof item.fullName === "string",
            );

            setAddresses(validAddresses);

            const selectedAddressExists = validAddresses.some(
              (address) =>
                address.id === savedSelectedAddressId,
            );

            setSelectedAddressId(
              selectedAddressExists
                ? savedSelectedAddressId ?? ""
                : validAddresses[0]?.id ?? "",
            );
          }
        } else {
          setSelectedAddressId("");
        }
      } catch (error) {
        console.error(
          "Unable to load shipping addresses:",
          error,
        );

        setAddresses([]);
        setSelectedAddressId("");
      } finally {
        setAddressLoaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!addressLoaded) return;

    try {
      localStorage.setItem(
        ADDRESS_STORAGE_KEY,
        JSON.stringify(addresses),
      );
    } catch (error) {
      console.error(
        "Unable to save shipping addresses:",
        error,
      );
    }
  }, [addresses, addressLoaded]);

  useEffect(() => {
    if (!addressLoaded) return;

    try {
      if (selectedAddressId) {
        localStorage.setItem(
          SELECTED_ADDRESS_STORAGE_KEY,
          selectedAddressId,
        );
      } else {
        localStorage.removeItem(
          SELECTED_ADDRESS_STORAGE_KEY,
        );
      }
    } catch (error) {
      console.error(
        "Unable to save selected address:",
        error,
      );
    }
  }, [selectedAddressId, addressLoaded]);

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

  const handleSaveAddress = async (
    address: ShippingAddressData,
    mode: "add" | "edit",
  ) => {
    setAddresses((previous) => {
      if (mode === "add") {
        return [...previous, address];
      }

      return previous.map((item) =>
        item.id === address.id ? address : item,
      );
    });

    setSelectedAddressId(address.id);
  };

  const handleDeleteAddress = (
    address: ShippingAddressData,
  ) => {
    const remainingAddresses = addresses.filter(
      (item) => item.id !== address.id,
    );

    setAddresses(remainingAddresses);

    if (selectedAddressId === address.id) {
      setSelectedAddressId(
        remainingAddresses[0]?.id ?? "",
      );
    }
  };

  const handleSelectAddress = (
    address: ShippingAddressData,
  ) => {
    setSelectedAddressId(address.id);
  };

  const showDialog = (
    status: ConfirmationStatus,
    title: string,
    description: string,
  ) => {
    setDialogStatus(status);
    setDialogTitle(title);
    setDialogDescription(description);
    setDialogOpen(true);
  };

  const handleProceedToPay = useCallback(
    async (address: ShippingAddressData) => {
      if (isSubmittingOrder) return;

      if (items.length === 0) {
        setOrderMessage("Your cart is empty.");

        showDialog(
          "warning",
          "Your Cart Is Empty",
          "Please add products to your cart before checking out.",
        );

        return;
      }

      setPendingAddress(address);
      setIsSubmittingOrder(true);
      setOrderMessage("");

      showDialog(
        "inprogress",
        "Connecting to Secure Payment",
        "Please wait while we connect you to Zoho Payments.",
      );

      try {
        const names = address.fullName
          .trim()
          .split(/\s+/)
          .filter(Boolean);

        const firstName = names[0] ?? "";
        const lastName = names.slice(1).join(" ");

        const orderProducts: SubmitOrderProduct[] =
          items.map((item) => {
            const productPrice = parsePrice(
              item.product.product_price,
            );

            const quantity = item.quantity;
            const netAmount = productPrice * quantity;

            return {
              product_id: String(item.product.product_id),
              product_name: item.product.product_name,
              product_price: productPrice.toFixed(2),
              quantity_ordered: String(quantity),
              net_amount: netAmount.toFixed(2),

              first_name: firstName,
              last_name: lastName,

              phone_number: address.phone,

              email_id: address.email,

              address_line_1: address.addressLine,
              address_line_2: address.addressLine2 ?? "",

              pincode: address.pincode,
              country: address.country,
              state: address.state,
              city: address.city,
            };
          });

        const payload: SubmitOrderPayload = {
          sub_total: subtotal.toFixed(2),
          cgst_amount: cgst_amount.toFixed(2),
          sgst_amount: sgst_amount.toFixed(2),
          order_amount: grandTotal.toFixed(2),
          order_products: orderProducts,
        };

        console.log("Submitting order payload:", payload);

        console.log("Order totals:", {
          totalInclusive,
          subtotal,
          gstPercentage,
          cgst_amount,
          sgst_amount,
          totalGST,
          grandTotal,
          totalItems,
        });

        redirectToPaymentGateway(payload);
      } catch (error) {
        console.error("Unable to start payment:", error);

        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while placing your order.";

        setOrderMessage(message);

        showDialog(
          "failed",
          "Unable to Start Payment",
          message,
        );
      } finally {
        setIsSubmittingOrder(false);
      }
    },
    [
      isSubmittingOrder,
      items,
      subtotal,
      cgst_amount,
      sgst_amount,
      grandTotal,
      totalInclusive,
      gstPercentage,
      totalGST,
      totalItems,
    ],
  );

  const handleRetryOrder = () => {
    if (!pendingAddress || isSubmittingOrder) return;

    setDialogOpen(false);

    handleProceedToPay(pendingAddress);
  };

  const handleCloseDialog = () => {
    if (dialogStatus === "inprogress") return;

    setDialogOpen(false);
  };

  if (!hydrated || !addressLoaded) {
    return (
      <PageSection className="text-white">
        <Container>
          <p aria-live="polite">Loading checkout...</p>
        </Container>
      </PageSection>
    );
  }

  return (
    <PageSection className="page-section-checkout">

      {orderMessage && !dialogOpen && (
        <p role="status" aria-live="polite">
          {orderMessage}
        </p>
      )}

      {items.length === 0 ? (

        <section className="checkout-result checkout-result--empty" aria-live="polite">
          <Container>
            <div className="checkout-result__content">
              <div
                className="checkout-result__icon checkout-result__icon--empty"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 3H5L7.2 14.2C7.4 15.2 8.2 16 9.3 16H18"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 7H21L19 13H8"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="20" r="1.3" fill="currentColor" />
                  <circle cx="18" cy="20" r="1.3" fill="currentColor" />
                </svg>
              </div>

              <span className="checkout-result__eyebrow">
                Your shopping journey
              </span>

              <h1 className="checkout-result__title">
                Your cart is empty
              </h1>

              <p className="checkout-result__description">
                Discover handcrafted sculptures and bring a
                piece of India’s artistic heritage into your
                home.
              </p>

              <div className="checkout-result__actions">
                <Link
                  href="/products/collections"
                  className="checkout-result__button checkout-result__button--primary"
                >
                  Explore Collections
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </Container>
        </section>

      ) : (

        <ShippingAddress
          addresses={addresses}
          cartItems={items.map(
            (item): CartOrderItem => ({
              product_id: item.product.product_id,
              product_name: item.product.product_name,
              product_price: item.product.product_price,
              quantity: item.quantity,
            }),
          )}
          selectedAddressId={selectedAddressId}
          subtotal={subtotal}
          cgst={cgst_amount}
          sgst={sgst_amount}
          grandTotal={grandTotal}
          onSaveAddress={handleSaveAddress}
          onSelectAddress={handleSelectAddress}
          onDeleteAddress={handleDeleteAddress}
          onProceedToPay={handleProceedToPay}
        />
      )}

      {isSubmittingOrder && (
        <p
          className="checkout-submitting"
          aria-live="polite"
        >
          Submitting your order...
        </p>
      )}

      <ConfirmationDialog
        open={dialogOpen}
        status={dialogStatus}
        title={dialogTitle}
        description={dialogDescription}
        primaryActionLabel={
          dialogStatus === "failed" ? "Try Again" : undefined
        }
        secondaryActionLabel={
          dialogStatus === "failed" ? "Close" : undefined
        }
        autoCloseDuration={5000}
        autoClose={true}

        onPrimaryAction={() => {
          if (dialogStatus === "success") {
            setDialogOpen(false);
          }

          if (dialogStatus === "failed") {
            handleRetryOrder();
          }
        }}
        onSecondaryAction={handleCloseDialog}
        onClose={handleCloseDialog}
        showCloseButton={dialogStatus !== "inprogress"}
        closeOnBackdrop={false}
      />
    </PageSection>
  );
}