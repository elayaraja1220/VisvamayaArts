export function getProductCategoryIds(
  categoryIds: string | number | string[] | number[] | null | undefined
): string[] {
  if (categoryIds == null || categoryIds === "") {
    return [];
  }

  if (Array.isArray(categoryIds)) {
    return categoryIds.map(String);
  }

  // Supports API values such as:
  // "1,2,3"
  // "1"
  // "[1,2,3]"

  const value = String(categoryIds).trim();

  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      // Continue with comma-separated handling
    }
  }

  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function productMatchesCategory(
  productCategoryIds:
    | string
    | number
    | string[]
    | number[]
    | null
    | undefined,
  categoryId: string
): boolean {
  const ids = getProductCategoryIds(productCategoryIds);

  return ids.includes(String(categoryId));
}