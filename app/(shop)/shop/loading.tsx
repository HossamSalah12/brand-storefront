export default function ShopLoading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 h-8 w-40 animate-pulse bg-stone-light" />
      <div className="mb-8 h-10 w-full animate-pulse bg-stone-light/60" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[3/4] animate-pulse bg-stone-light" />
            <div className="h-3 w-3/4 animate-pulse bg-stone-light" />
            <div className="h-3 w-1/3 animate-pulse bg-stone-light" />
          </div>
        ))}
      </div>
    </main>
  );
}
