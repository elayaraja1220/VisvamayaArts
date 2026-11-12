export const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type SlugProduct = {
  product_id: string | number;
  product_name: string;
};

// Builds slug <-> id maps. If two products share a name,
// the later one gets "-<id>" added so slugs stay unique.
export function buildSlugMap<T extends SlugProduct>(products: T[]) {
  const seen = new Map<string, number>();
  const idToSlug = new Map<string, string>();
  const slugToId = new Map<string, string>();

  for (const p of products) {
    const base = slugify(p.product_name ?? "") || String(p.product_id);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    const slug = count === 0 ? base : `${base}-${p.product_id}`;
    idToSlug.set(String(p.product_id), slug);
    slugToId.set(slug, String(p.product_id));
  }

  return { idToSlug, slugToId };
}