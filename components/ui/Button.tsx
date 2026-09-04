import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

/**
 * Base button. Sharp corners, no shadow, no gradient — see design system.
 * Primary = solid ink, used for the single most important action on a screen
 * (Add to Cart, Place Order). Secondary/ghost for everything else so the
 * primary action stays visually dominant.
 */
export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "relative inline-flex items-center justify-center overflow-hidden font-body uppercase tracking-widest2 transition-all duration-200 ease-editorial disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]",
        {
          "bg-ink text-bone hover:bg-clay": variant === "primary",
          "border border-ink text-ink hover:bg-ink hover:text-bone":
            variant === "secondary",
          "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:scale-x-0 after:bg-clay after:transition-transform after:duration-300 after:ease-editorial hover:text-clay hover:after:origin-left hover:after:scale-x-100":
            variant === "ghost",
        },
        {
          "px-4 py-2 text-xs": size === "sm",
          "px-6 py-3 text-sm": size === "md",
          "px-8 py-4 text-sm": size === "lg",
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
