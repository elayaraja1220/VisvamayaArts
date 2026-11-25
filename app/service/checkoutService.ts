import { withBasePath } from "@/app/utils/basePath";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  "https://vismayamarts.in/admin/vismayam_service"
).replace(/\/+$/, "");

export const PAYMENT_ATTEMPT_STORAGE_KEY = "vismayam-payment-attempt";

export type CheckoutAddress = {
  receiverFirstName: string;
  receiverLastName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  country: string;
  state: string;
  city: string;
  block: string
};

export type CheckoutCartItem = {
  product_id: string;
  product_name: string;
  product_price: string | number;
  quantity: number;
};

export type SubmitOrderProduct = {
  product_id: string;
  product_name: string;
  product_price: string;
  quantity_ordered: string;
  net_amount: string;

  first_name: string;
  last_name: string;
  phone_number: string;
  email_id: string;

  address_line_1: string;
  address_line_2: string;
  pincode: string;
  country: string;
  state: string;
  city: string;
};

export type SubmitOrderPayload = {
  sub_total: string;
  cgst_amount: string;
  sgst_amount: string;
  order_amount: string;
  order_products: SubmitOrderProduct[];
};

export function redirectToPaymentGateway(
  payload: SubmitOrderPayload,
): void {
  if (typeof window === "undefined") {
    throw new Error("Payment checkout can only be started in a browser.");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${API_URL}/submitOrderPayment`;
  form.hidden = true;

  const fields: Record<string, string> = {
    order: JSON.stringify({
      sub_total: payload.sub_total,
      cgst_amount: payload.cgst_amount,
      sgst_amount: payload.sgst_amount,
      order_amount: payload.order_amount,
    }),
    order_products: JSON.stringify(payload.order_products),
    success_url: new URL(
      withBasePath("/payment/success/"),
      window.location.origin,
    ).toString(),
    failure_url: new URL(
      withBasePath("/payment/failed/"),
      window.location.origin,
    ).toString(),
  };

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  sessionStorage.setItem(
    PAYMENT_ATTEMPT_STORAGE_KEY,
    String(Date.now()),
  );
  form.submit();
}
