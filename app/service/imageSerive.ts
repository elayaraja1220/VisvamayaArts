const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_API_PUBLIC_PRODUCT_IMAGE_BASE_URL ??
  "https://vismayamarts.in/admin/assets/images/products";

export function getProductImageUrl(imagePath?: string): string {
  if (!imagePath?.trim()) {
    return "";
  }

  const path = imagePath.trim();

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const filename = path.replace(/^\/+/, "");

  return `${IMAGE_BASE_URL.replace(/\/+$/, "")}/${filename}`;
}
