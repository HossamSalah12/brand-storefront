export default function AccountLoading() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col gap-4 px-6 py-16">
      <div className="h-8 w-48 animate-pulse bg-stone-light" />
      <div className="h-40 w-full animate-pulse bg-stone-light/60" />
      <div className="h-40 w-full animate-pulse bg-stone-light/60" />
    </main>
  );
}
