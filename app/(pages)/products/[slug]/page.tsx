import ProductBySlug from "./ProductBySlug";
import { getProductCollections } from "@/app/service/dataService";
import { buildSlugMap } from "@/app/utils/slugify";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const params = [{ slug: "__fallback" }];

  if (process.env.NODE_ENV === "development") {
    try {
      const products = await getProductCollections();
      const oldestFirst = [...products].sort(
        (a, b) => Number(a.product_id) - Number(b.product_id),
      );
      const { slugToId } = buildSlugMap(oldestFirst);
      for (const slug of slugToId.keys()) params.push({ slug });
    } catch {
    }
  }

  return params;
}

export default function ProductDetailsPage() {
  return <ProductBySlug />;
}
