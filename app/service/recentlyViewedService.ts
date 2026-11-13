const STORAGE_KEY = "vismayam-recently-viewed";
const MAX_PRODUCTS = 8;

export function getRecentlyViewedIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return [
      ...new Set(
        parsed.filter(
          (id): id is string =>
            typeof id === "string" && id.length > 0
        )
      ),
    ].slice(0, MAX_PRODUCTS);
  } catch {
    return [];
  }
}

export function saveRecentlyViewedId(productId: string): void {
  if (typeof window === "undefined" || !productId) return;

  try {
    const existing = getRecentlyViewedIds();

    const updated = [
      productId,
      ...existing.filter((id) => id !== productId),
    ].slice(0, MAX_PRODUCTS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    window.dispatchEvent(new Event("recently-viewed-updated"));
  } catch {
  }
}