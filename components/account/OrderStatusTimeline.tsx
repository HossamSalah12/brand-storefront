"use client";

import { clsx } from "clsx";
import { useLocale } from "@/lib/i18n/LocaleContext";

const STEP_KEYS = ["pending", "confirmed", "preparing", "shipped", "delivered"];

export function OrderStatusTimeline({ status }: { status: string }) {
  const { t } = useLocale();

  if (status === "cancelled" || status === "returned") {
    return (
      <p className="text-sm text-clay">
        {status === "cancelled" ? t("orderStatus.cancelled") : t("orderStatus.returned")}
      </p>
    );
  }

  const currentIndex = STEP_KEYS.indexOf(status);

  return (
    <div className="flex items-center">
      {STEP_KEYS.map((key, i) => (
        <div key={key} className="flex flex-1 flex-col items-center last:flex-none">
          <div className="flex w-full items-center">
            <div
              className={clsx(
                "h-2 w-2 shrink-0 rounded-full",
                i <= currentIndex ? "bg-ink" : "bg-stone-light",
              )}
            />
            {i < STEP_KEYS.length - 1 && (
              <div
                className={clsx(
                  "h-px flex-1",
                  i < currentIndex ? "bg-ink" : "bg-stone-light",
                )}
              />
            )}
          </div>
          <span
            className={clsx(
              "mt-2 text-center text-xs",
              i <= currentIndex ? "text-ink" : "text-stone",
            )}
          >
            {t(`orderStatus.${key}`)}
          </span>
        </div>
      ))}
    </div>
  );
}
