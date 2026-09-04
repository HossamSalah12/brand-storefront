import Link from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-xs uppercase tracking-widest2 text-stone">
      {items.map((item, i) => (
        <span key={item.label}>
          {item.href ? (
            <Link href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="mx-2 text-stone-light">/</span>}
        </span>
      ))}
    </nav>
  );
}
