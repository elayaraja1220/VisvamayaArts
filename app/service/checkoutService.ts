const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://vismayamarts.in/admin/vismayam_service";

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

export async function submitOrder(
  payload: SubmitOrderPayload,
): Promise<boolean> {
  const formData = new URLSearchParams();

  formData.append(
    "order",
    JSON.stringify({
      sub_total: payload.sub_total,
      cgst_amount: payload.cgst_amount,
      sgst_amount: payload.sgst_amount,
      order_amount: payload.order_amount,
    }),
  );

  formData.append(
    "order_products",
    JSON.stringify(payload.order_products),
  );

  const response = await fetch(`${API_URL}/submitOrder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Order API failed: ${response.status}`);
  }

  const result = (await response.text()).trim();

  console.log("submitOrder API response:", result);

  if (result === "1") {
    return true;
  }

  if (result === "0") {
    return false;
  }

  throw new Error(`Unexpected submitOrder response: ${result}`);
}