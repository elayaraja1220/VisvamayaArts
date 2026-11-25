import type { Metadata } from "next";

import PaymentResult from "@/app/components/paymentResult/paymentResult";

export const metadata: Metadata = {
  title: "Payment Failed | Vismayam Arts",
};

export default function PaymentFailedPage() {
  return <PaymentResult status="failed" />;
}
