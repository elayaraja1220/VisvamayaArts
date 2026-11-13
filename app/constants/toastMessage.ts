export const toastMessages = {
  cart: {
    added: (productName: string) => ({
      variant: "success" as const,
      title: "Added to cart",
      message: `${productName} has been added to your cart.`,
    }),

    removed: (productName: string) => ({
      variant: "info" as const,
      title: "Removed from cart",
      message: `${productName} has been removed from your cart.`,
    }),

    buyNow: {
      variant: "success" as const,
      title: "Proceeding to checkout",
      message: "Redirecting you to checkout.",
    },
  },

  wishlist: {
    added: (productName: string) => ({
      variant: "success" as const,
      title: "Wishlist updated",
      message: `${productName} added to your wishlist.`,
    }),

    unavailable: {
      variant: "info" as const,
      title: "Coming soon",
      message: "Wishlist functionality will be available soon.",
    },
  },

  common: {
    error: {
      variant: "error" as const,
      title: "Something went wrong",
      message: "Please try again later.",
    },
  },
};
