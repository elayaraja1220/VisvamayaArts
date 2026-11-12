"use client";

import { useEffect } from "react";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.classList.add("product-details-body");

    return () => {
      document.body.classList.remove("product-details-body");
    };
  }, []);

  return (
    <>
      {children}
    </>
  );
}