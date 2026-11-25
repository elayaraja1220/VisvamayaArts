"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "@/app/context/cartContext";
import { PAYMENT_ATTEMPT_STORAGE_KEY } from "@/app/service/checkoutService";
import { withBasePath } from "@/app/utils/basePath";

import "./paymentResult.css";

const PAYMENT_ATTEMPT_MAX_AGE_MS = 30 * 60 * 1000;

type PaymentResultProps = {
  status: "success" | "failed";
};

export default function PaymentResult({ status }: PaymentResultProps) {
  const isSuccess = status === "success";
  const { clearCart, hydrated } = useCart();
  const router = useRouter();
  const accessCheckStarted = useRef(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (accessCheckStarted.current) return;
    accessCheckStarted.current = true;

    try {
      const startedAt = Number(
        sessionStorage.getItem(PAYMENT_ATTEMPT_STORAGE_KEY),
      );
      sessionStorage.removeItem(PAYMENT_ATTEMPT_STORAGE_KEY);

      const isRecentAttempt =
        Number.isSafeInteger(startedAt) &&
        startedAt > 0 &&
        Date.now() >= startedAt &&
        Date.now() - startedAt <= PAYMENT_ATTEMPT_MAX_AGE_MS;

      if (!isRecentAttempt) {
        router.replace("/");
        return;
      }

      setAuthorized(true);
    } catch (error) {
      console.error("Unable to validate payment result page access.", error);
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    if (authorized && isSuccess && hydrated) {
      clearCart();
    }
  }, [authorized, clearCart, hydrated, isSuccess]);

  if (!authorized) return null;

  return (
    <main
      className={`payment-result payment-result--${status}`}
      aria-labelledby="payment-result-title"
    >
      <header className="payment-result__header">
        <Image
          className="payment-result__brand"
          src={withBasePath("/images/brands/Vismayam-Brand.svg")}
          alt="Vismayam Arts"
          width={149}
          height={79}
          priority
        />
      </header>

      <section className="payment-result__receipt">
        <Link
          className="payment-result__home-link"
          href="/"
          onClick={isSuccess ? clearCart : undefined}
        >
          Go to Home
        </Link>

        <div className="payment-result__content">
          {isSuccess ? (
            <div className="payment-result__success-icon" aria-hidden="true">
              <span />
            </div>
          ) : (
            <svg
              className="payment-result__failed-icon"
              viewBox="0 0 90 82"
              role="img"
              aria-label="Payment failed"
            >
              <path
                d="M36.3 5.5a10 10 0 0 1 17.4 0l34 59A10 10 0 0 1 79 79H11A10 10 0 0 1 2.3 64.5z"
                fill="currentColor"
              />
              <path
                d="M45 31v17"
                stroke="#fff"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx="45" cy="62" r="4.2" fill="#fff" />
            </svg>
          )}

          <h1 id="payment-result-title">
            {isSuccess ? "Payment Successful!" : "Payment Failed!"}
          </h1>

          <p className="payment-result__message">
            {isSuccess
              ? "Thank you for your payment. Your order has been confirmed."
              : "Your payment could not be completed."}
            {!isSuccess && (
              <strong>Please try again or contact us for help.</strong>
            )}
          </p>

          <div className="payment-result__actions">
            {isSuccess ? (
              <Link
                className="payment-result__button"
                href="/products/collections"
                onClick={clearCart}
              >
                Continue Shopping
              </Link>
            ) : (
              <>
                <Link className="payment-result__button" href="/checkout">
                  Try Again
                </Link>
                <Link
                  className="payment-result__button payment-result__button--secondary"
                  href="/contact"
                >
                  Contact Us
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
