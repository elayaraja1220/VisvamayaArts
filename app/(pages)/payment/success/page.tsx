import type { Metadata } from "next";

import PaymentResult from "@/app/components/paymentResult/paymentResult";

export const metadata: Metadata = {
  title: "Payment Successful | Vismayam Arts",
};

export default function PaymentSuccessPage() {
  return <PaymentResult status="success" />;
}
