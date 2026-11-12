"use client";

import { useEffect } from "react";
import { saveRecentlyViewedId } from "@/app/service/recentlyViewedService";

type Props = {
  productId: string;
};

export default function TrackRecentlyViewed({ productId }: Props) {
  useEffect(() => {
    saveRecentlyViewedId(productId);
  }, [productId]);

  return null;
}