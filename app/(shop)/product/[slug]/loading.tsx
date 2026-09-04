export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-[3/4] animate-pulse bg-stone-light" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-2/3 animate-pulse bg-stone-light" />
          <div className="h-5 w-24 animate-pulse bg-stone-light" />
          <div className="h-16 w-full animate-pulse bg-stone-light/60" />
          <div className="mt-4 h-9 w-full animate-pulse bg-stone-light/60" />
          <div className="h-9 w-2/3 animate-pulse bg-stone-light/60" />
          <div className="mt-4 h-12 w-full animate-pulse bg-stone-light" />
        </div>
      </div>
    </main>
  );
}
