export function DeliveryInfo({ locale }: { locale: "ar" | "en" }) {
  const isEn = locale === "en";

  const rows = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      ),
      text: isEn ? "Delivery within 2–5 business days" : "التوصيل خلال 2 إلى 5 أيام عمل",
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 10h13a4 4 0 0 1 4 4v3" />
          <path d="M9 4 3 10l6 6" />
        </svg>
      ),
      text: isEn ? "14-day return & exchange" : "استبدال واسترجاع خلال 14 يوم",
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="6" width="20" height="12" rx="1.5" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      ),
      text: isEn ? "Cash on delivery available" : "الدفع عند الاستلام متاح",
    },
  ];

  return (
    <div className="flex flex-col gap-3 border-t border-stone-light pt-4">
      {rows.map((row) => (
        <div key={row.text} className="flex items-center gap-3 text-sm text-stone">
          <span className="text-ink">{row.icon}</span>
          {row.text}
        </div>
      ))}
    </div>
  );
}
