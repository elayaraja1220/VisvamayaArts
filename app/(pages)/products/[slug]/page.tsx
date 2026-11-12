import ProductBySlug from "./ProductBySlug";

export const dynamic = "force-static";
export const dynamicParams = false;

// Fully live: the build creates ONE product page, products/__fallback/.
// public/.htaccess serves it for every /products/<slug>/ URL, and the page
// finds the product from the URL and loads its details from the API.
// So products added in the admin never need a rebuild.
export function generateStaticParams() {
  return [{ slug: "__fallback" }];
}

export default function ProductDetailsPage() {
  return <ProductBySlug />;
}
