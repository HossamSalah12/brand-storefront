import type { ReactNode } from "react";

export function StaticPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-8 font-display text-2xl">{title}</h1>
      <div className="flex flex-col gap-4 text-sm leading-7 text-stone [&_strong]:text-ink">
        {children}
      </div>
    </main>
  );
}
