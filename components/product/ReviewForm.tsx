"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createReviewAction, type ActionState } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleContext";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { locale } = useLocale();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? (locale === "en" ? "Submitting..." : "جارٍ الإرسال...") : (locale === "en" ? "Submit Review" : "إرسال التقييم")}
    </Button>
  );
}

export function ReviewForm({
  productId,
  orderItemId,
}: {
  productId: string;
  orderItemId: string;
}) {
  const action = createReviewAction.bind(null, productId, orderItemId);
  const [state, formAction] = useFormState<ActionState, FormData>(action, null);
  const [rating, setRating] = useState(0);
  const { locale } = useLocale();

  if (state?.success) {
    return (
      <p className="text-sm text-moss">
        {locale === "en"
          ? "Thank you — your review is pending approval and will appear once approved."
          : "شكرًا لك، تقييمك قيد المراجعة وسيظهر بعد اعتماده."}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 border border-stone-light p-4">
      <p className="text-sm">{locale === "en" ? "Add your review for this product" : "أضف تقييمك لهذا المنتج"}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} stars`}
            className="text-xl leading-none"
          >
            {n <= rating ? "★" : "☆"}
          </button>
        ))}
        <input type="hidden" name="rating" value={rating} />
      </div>
      <textarea
        name="comment"
        placeholder={locale === "en" ? "Share your thoughts on the product (optional)" : "اكتب رأيك في المنتج (اختياري)"}
        className="min-h-20 border border-stone-light bg-transparent px-3 py-2 text-sm"
      />
      {state?.error && <p className="text-sm text-clay">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
