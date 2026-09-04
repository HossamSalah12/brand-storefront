"use client";

import { useEffect } from "react";
import { trackRecentlyViewed } from "@/lib/utils/recentlyViewed";

export function TrackProductView({ productId }: { productId: string }) {
  useEffect(() => {
    trackRecentlyViewed(productId);
  }, [productId]);

  return null;
}
