export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center py-24 text-stone text-sm uppercase tracking-widest2"
    >
      <span className="animate-pulse">{label}</span>
    </div>
  );
}
