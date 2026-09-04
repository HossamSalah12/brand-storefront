"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleWishlistAction } from "@/lib/actions/wishlist";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { clsx } from "clsx";

export function WishlistButton({
  productId,
  initialInWishlist = false,
  className,
}: {
  productId: string;
  initialInWishlist?: boolean;
  className?: string;
}) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [justToggled, setJustToggled] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useLocale();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleWishlistAction(productId);
      if ("error" in result && result.error === "login_required") {
        router.push("/account/login?redirect=/account/wishlist");
        return;
      }
      if ("inWishlist" in result) {
        setInWishlist(result.inWishlist);
        if (result.inWishlist) {
          setJustToggled(true);
          setTimeout(() => setJustToggled(false), 300);
        }
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={inWishlist}
      aria-label={inWishlist ? t("product.removeFromWishlist") : t("product.addToWishlist")}
      className={clsx(
        "flex h-8 w-8 items-center justify-center bg-bone/90 text-sm transition-transform duration-150 ease-editorial hover:scale-110",
        justToggled && "animate-heart-pop",
        className,
      )}
    >
      <span className={inWishlist ? "text-clay" : ""}>{inWishlist ? "♥" : "♡"}</span>
    </button>
  );
}
