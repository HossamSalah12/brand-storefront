import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-stone">{description}</p>
      )}
      {action}
    </div>
  );
}
