"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "../service/dataService";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  addToCart: (product: Product) => void;
  updateQuantity: (
    productId: Product["product_id"],
    quantity: number
  ) => void;
  removeFromCart: (productId: Product["product_id"]) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "vismayam-cart";

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          const validItems = parsed.filter((item): item is CartItem => {
            if (!item || typeof item !== "object") return false;

            const candidate = item as Partial<CartItem>;
            const product = candidate.product;

            return (
              !!product &&
              typeof product === "object" &&
              typeof product.product_id === "string" &&
              Number.isInteger(candidate.quantity) &&
              (candidate.quantity ?? 0) > 0
            );
          });

          setItems(validItems);
        }
      }
    } catch (error) {
      console.error("Unable to restore the saved cart.", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Unable to save the cart.", error);
    }
  }, [items, hydrated]);

  const addToCart = useCallback((product: Product) => {
    setItems((current) => {
      const existing = current.find(
        (item) => item.product.product_id === product.product_id
      );

      if (existing) {
        return current.map((item) =>
          item.product.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: Product["product_id"], quantity: number) => {
      if (!Number.isInteger(quantity) || quantity < 1) return;

      setItems((current) =>
        current.map((item) =>
          item.product.product_id === productId
            ? { ...item, quantity }
            : item
        )
      );
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: Product["product_id"]) => {
      setItems((current) =>
        current.filter(
          (item) => item.product.product_id !== productId
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const count = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = items.reduce((total, item) => {
    const price = Number(item.product.product_price);

    return (
      total +
      (Number.isFinite(price) && price >= 0 ? price : 0) *
        item.quantity
    );
  }, 0);

  const value = useMemo<CartContextType>(
    () => ({
      items,
      count,
      subtotal,
      hydrated,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      items,
      count,
      subtotal,
      hydrated,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
