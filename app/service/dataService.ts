const baseURL = (
  process.env.NEXT_PUBLIC_API_URL ?? ""
).replace(/\/+$/, "");

const appreciationImageBaseURL = (
  process.env.NEXT_PUBLIC_API_APPRECTION_IMAGE_BASE_URL ?? ""
).replace(/\/+$/, "");

export type Product = {
  product_id: string;
  product_category_id: string | number | string[] | number[];

  product_name: string;
  product_category_name: string | string[];
  product_description: string;
  product_description_heading: string;
  product_period: string;
  product_description_detailed?: string;
  product_dimension: string;
  product_dimension_detailed?: string;
  product_price: string;
  product_image: string;
  product_images?: string[] | string | null;
  product_360_image?: string;
  new_arrivals?: string | number;
  display_order?: string;
  display_product?: string;
  is_active?: string;
  product_audio_file?: string | null;
  product_youtube_url?: string | null;
  product_facebook_url?: string | null;
  product_instagram_url?: string | null;
};

export type Category = {
  image: string;
  product_category_id: string;
  product_category_name: string;
  display_order: string;
  display_category: string;
  is_active: string;
  product_image: string;
  product_category_image: string;
};

export type OrderAddress = {
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

export type OrderProduct = OrderAddress & {
  product_id: string;
  product_name: string;
  product_price: string;
  quantity_ordered: string;
  net_amount: string;
};

export type SubmitOrderPayload = {
  sub_total: string;
  cgst_amount: string;
  sgst_amount: string;
  order_amount: string;
  order_products: OrderProduct[];
};

export type Appreciation = {
  appreciation_url: string;
  appreciation_image: string;
};

function getApiURL(endpoint: string): string {
  if (!baseURL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing. Check your project-root .env file.",
    );
  }

  const cleanEndpoint = endpoint.replace(/^\/+/, "");

  return `${baseURL}/${cleanEndpoint}`;
}

function parseArrayResponse<T>(result: unknown): T[] {
  if (Array.isArray(result)) {
    return result as T[];
  }

  if (result && typeof result === "object") {
    return [result as T];
  }

  return [];
}

function sortNewestFirst(products: Product[]): Product[] {
  return [...products].sort(
    (a, b) => Number(b.product_id) - Number(a.product_id),
  );
}

async function request<T>(
  endpoint: string,
  params?: Record<string, string | number>,
): Promise<T[]> {
  let url: string;

  try {
    url = getApiURL(endpoint);
  } catch (error) {
    console.error("[DataService] API URL configuration error:", error);
    return [];
  }

  try {
    const isServer = typeof window === "undefined";

    const options: RequestInit & { next?: { revalidate: number } } = {
      method: params ? "POST" : "GET",
      ...(params ? { cache: "no-store" } : { next: { revalidate: 300 } }),
    };

    const headers: Record<string, string> = { Accept: "application/json" };

    if (isServer) {
      headers["User-Agent"] = "Mozilla/5.0 (compatible; VismayamSite/1.0)";
    }

    if (params) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      options.body = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)]),
      ).toString();
    }

    options.headers = headers;

    console.info("[DataService] Request:", url);

    const response = await fetch(url, options);

    console.info(
      `[DataService] ${endpoint}:`,
      response.status,
      response.statusText,
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.warn(
        `[DataService] ${endpoint} failed:`,
        response.status,
        responseText.slice(0, 200),
      );
      return [];
    }

    let result: unknown;

    try {
      result = JSON.parse(responseText);
    } catch {
      console.warn(
        `[DataService] ${endpoint} returned invalid JSON:`,
        responseText.slice(0, 200),
      );
      return [];
    }

    return parseArrayResponse<T>(result);
  } catch (error) {
    console.warn(`[DataService] Network/CORS error for ${endpoint}:`, error);
    return [];
  }
}

export async function getNewArrivals(): Promise<Product[]> {
  const products = await request<Product>("getNewArrivals");
  return sortNewestFirst(products);
}

export function getProductCategories(): Promise<Category[]> {
  return request<Category>("getProductCategories");
}

export function getProductsByCategory(
  categoryId: number | string,
): Promise<Product[]> {
  return request<Product>("getProductsByCategory", {
    product_category_id: categoryId,
  });
}

export function getAllProducts(): Promise<Product[]> {
  return request<Product>("getAllProducts");
}

export function gellAllProducts(): Promise<Product[]> {
  return getAllProducts();
}

export async function getProductCollections(): Promise<Product[]> {
  const [allProducts, newArrivals] = await Promise.all([
    getAllProducts(),
    request<Product>("getNewArrivals"),
  ]);

  const unique = Array.from(
    new Map(
      [...allProducts, ...newArrivals]
        .filter((product) => product.product_id)
        .map((product) => [String(product.product_id), product]),
    ).values(),
  );

  return sortNewestFirst(unique);
}

export async function getProductById(
  productId: string | number,
): Promise<Product | null> {
  const id = String(productId);

  if (!/^\d+$/.test(id)) {
    console.warn("[DataService] Invalid product ID:", productId);
    return null;
  }

  const products = await request<Product>("getProductById", {
    product_id: id,
  });

  return (
    products.find((product) => String(product.product_id) === id) ?? null
  );
}

export async function submitOrder(
  payload: SubmitOrderPayload,
): Promise<boolean> {
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API_URL is missing. Check your .env file.");
  }

  if (payload.order_products.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const body = new URLSearchParams();

  body.append(
    "order",
    JSON.stringify({
      sub_total: payload.sub_total,
      cgst_amount: payload.cgst_amount,
      sgst_amount: payload.sgst_amount,
      order_amount: payload.order_amount,
    }),
  );

  body.append("order_products", JSON.stringify(payload.order_products));

  const response = await fetch(getApiURL("submitOrder"), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Order submission failed: ${response.status} ${response.statusText}`,
    );
  }

  const result = (await response.text()).trim().replace(/^"|"$/g, "");

  if (result === "1") return true;
  if (result === "0") return false;

  throw new Error(`Unexpected submitOrder response: ${result}`);
}

export function getAppreciationImageUrl(
  image: string | null | undefined,
): string {
  if (!image) {
    return "/images/placeholder.png";
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  const cleanImage = image.replace(/^\/+/, "");

  return `${appreciationImageBaseURL}/${cleanImage}`;
}

export function getApprecitions(): Promise<Appreciation[]> {
  return request<Appreciation>("getAppreciations");
}

export type BulkOrderEnquiryPayload = {
  name: string;
  phone_number: string;
  mail_id: string;
  description: string;
};

export async function sendBulkOrderEnquiry(
  payload: BulkOrderEnquiryPayload,
): Promise<boolean> {
  const body = new URLSearchParams();

  body.append(
    "enquiry",
    JSON.stringify({
      name: payload.name.trim(),
      phone_number: payload.phone_number.trim(),
      mail_id: payload.mail_id.trim(),
      description: payload.description.trim(),
    }),
  );

  const response = await fetch(getApiURL("sendBulkOrderEnquiry"), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Enquiry submission failed: ${response.status} ${response.statusText}`,
    );
  }

  const result = (await response.text()).trim().replace(/^"|"$/g, "");

  if (result === "1") return true;
  if (result === "0") return false;

  throw new Error(`Unexpected enquiry response: ${result}`);
}

export interface PincodeDetails {
  country: string;
  state: string;
  city: string;
  district: string;
}

export async function getPincodeDetails(
  pincode: string
): Promise<PincodeDetails | null> {
  if (!/^\d{6}$/.test(pincode)) {
    return null;
  }

  const response = await fetch(
    `https://api.postalpincode.in/pincode/${pincode}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch pincode details.");
  }

  const result = await response.json();

  if (
    result?.[0]?.Status !== "Success" ||
    !result?.[0]?.PostOffice?.length
  ) {
    return null;
  }

  const office = result[0].PostOffice[0];

  return {
    country: office.Country,
    state: office.State,
    city: office.District,
    district: office.District,
  };
}
