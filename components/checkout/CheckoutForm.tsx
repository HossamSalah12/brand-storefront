"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/CartContext";
import { formatPrice } from "@/lib/utils/currency";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { placeOrderAction, validateCouponAction, type CouponPreview } from "@/lib/actions/checkout";
import { useLocale } from "@/lib/i18n/LocaleContext";

type Zone = { id: string; governorate: string; price: number | null };
type SavedAddress = {
  id: string;
  full_name: string;
  phone: string;
  governorate: string;
  city: string;
  full_address: string;
  building: string | null;
  apartment: string | null;
  floor: string | null;
  landmark: string | null;
  is_default: boolean;
};

export function CheckoutForm({
  zones,
  freeShippingThreshold,
  defaultShippingPrice,
  savedAddresses = [],
  defaultEmail = "",
}: {
  zones: Zone[];
  freeShippingThreshold: number;
  defaultShippingPrice: number;
  savedAddresses?: SavedAddress[];
  defaultEmail?: string;
}) {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const { t, locale } = useLocale();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const defaultAddress = savedAddresses.find((a) => a.is_default) ?? savedAddresses[0] ?? null;
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultAddress?.id ?? "new",
  );

  const [fullName, setFullName] = useState(defaultAddress?.full_name ?? "");
  const [phone, setPhone] = useState(defaultAddress?.phone ?? "");
  const [email, setEmail] = useState(defaultEmail);
  const [governorate, setGovernorate] = useState(
    defaultAddress?.governorate ?? zones[0]?.governorate ?? "",
  );
  const [city, setCity] = useState(defaultAddress?.city ?? "");
  const [fullAddress, setFullAddress] = useState(defaultAddress?.full_address ?? "");
  const [building, setBuilding] = useState(defaultAddress?.building ?? "");
  const [apartment, setApartment] = useState(defaultAddress?.apartment ?? "");
  const [floor, setFloor] = useState(defaultAddress?.floor ?? "");
  const [landmark, setLandmark] = useState(defaultAddress?.landmark ?? "");

  function applyAddress(id: string) {
    setSelectedAddressId(id);
    if (id === "new") {
      setFullName("");
      setPhone("");
      setGovernorate(zones[0]?.governorate ?? "");
      setCity("");
      setFullAddress("");
      setBuilding("");
      setApartment("");
      setFloor("");
      setLandmark("");
      return;
    }
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    setFullName(addr.full_name);
    setPhone(addr.phone);
    setGovernorate(addr.governorate);
    setCity(addr.city);
    setFullAddress(addr.full_address);
    setBuilding(addr.building ?? "");
    setApartment(addr.apartment ?? "");
    setFloor(addr.floor ?? "");
    setLandmark(addr.landmark ?? "");
  }

  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponPreview | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const discount = couponResult?.valid ? couponResult.discount : 0;
  const subtotalAfterDiscount = subtotal - discount;

  const shipping = useMemo(() => {
    if (subtotalAfterDiscount >= freeShippingThreshold && freeShippingThreshold > 0) return 0;
    const zone = zones.find((z) => z.governorate === governorate);
    return zone?.price ?? defaultShippingPrice;
  }, [governorate, zones, subtotalAfterDiscount, freeShippingThreshold, defaultShippingPrice]);

  const total = subtotalAfterDiscount + shipping;

  async function handleApplyCoupon() {
    setCheckingCoupon(true);
    const result = await validateCouponAction(couponCode, subtotal, locale);
    setCouponResult(result);
    setCheckingCoupon(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!items.length) {
      setError(t("checkout.emptyCart"));
      return;
    }

    startTransition(async () => {
      const result = await placeOrderAction({
        fullName,
        phone,
        email,
        governorate,
        city,
        fullAddress,
        building,
        apartment,
        floor,
        landmark,
        couponCode: couponResult?.valid ? couponCode : null,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        locale,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      clear();
      router.push(`/order-confirmation/${result.orderId}`);
    });
  }

  if (items.length === 0) {
    return <p className="text-stone">{t("checkout.emptyCart")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 md:grid-cols-3">
      <div className="flex flex-col gap-10 md:col-span-2">
        {/* 1. Contact */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg">{t("checkout.contactInfo")}</h2>
          <Input label={t("checkout.fullName")} name="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t("checkout.phone")} name="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label={t("checkout.email")} name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </section>

        {/* 2. Address */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg">{t("checkout.shippingAddress")}</h2>

          {savedAddresses.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest2 text-stone">
                {t("checkout.savedAddress")}
              </label>
              <select
                value={selectedAddressId}
                onChange={(e) => applyAddress(e.target.value)}
                className="border border-stone-light bg-transparent px-4 py-3 text-sm"
              >
                {savedAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.full_address}, {addr.city}, {addr.governorate}
                    {addr.is_default ? ` (${t("account.default")})` : ""}
                  </option>
                ))}
                <option value="new">{t("checkout.newAddress")}</option>
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest2 text-stone">{t("checkout.governorate")}</label>
            <select
              required
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              className="border border-stone-light bg-transparent px-4 py-3 text-sm"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.governorate}>
                  {z.governorate}
                </option>
              ))}
            </select>
          </div>
          <Input label={t("checkout.city")} name="city" required value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label={t("checkout.fullAddress")} name="fullAddress" required value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} />
          <div className="grid grid-cols-3 gap-4">
            <Input label={t("checkout.building")} name="building" value={building} onChange={(e) => setBuilding(e.target.value)} />
            <Input label={t("checkout.apartment")} name="apartment" value={apartment} onChange={(e) => setApartment(e.target.value)} />
            <Input label={t("checkout.floor")} name="floor" value={floor} onChange={(e) => setFloor(e.target.value)} />
          </div>
          <Input label={t("checkout.landmark")} name="landmark" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
        </section>

        {/* 3. Delivery method */}
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-lg">{t("checkout.deliveryMethod")}</h2>
          <div className="border border-stone-light px-4 py-3 text-sm">
            {t("checkout.standardDelivery")} — {shipping === 0 ? t("checkout.free") : formatPrice(shipping, locale)}
          </div>
        </section>

        {/* 4. Payment */}
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-lg">{t("checkout.paymentMethod")}</h2>
          <div className="border border-ink bg-ink/5 px-4 py-3 text-sm">
            {t("checkout.cod")}
          </div>
        </section>
      </div>

      {/* 5. Order summary */}
      <div className="h-fit border border-stone-light p-6">
        <h2 className="mb-4 font-display text-lg">{t("checkout.orderSummary")}</h2>
        <div className="flex flex-col gap-3 border-b border-stone-light pb-4">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-sm">
              <span>
                {item.productName} ({item.colorName}/{item.sizeName}) × {item.quantity}
              </span>
              <span>{formatPrice(item.unitPrice * item.quantity, locale)}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 py-4">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder={t("checkout.couponPlaceholder")}
            className="flex-1 border border-stone-light bg-transparent px-3 py-2 text-sm"
          />
          <Button type="button" variant="secondary" size="sm" onClick={handleApplyCoupon} disabled={checkingCoupon}>
            {checkingCoupon ? "..." : t("checkout.apply")}
          </Button>
        </div>
        {couponResult && (
          <p className={`mb-4 text-xs ${couponResult.valid ? "text-moss" : "text-clay"}`}>
            {couponResult.valid ? t("checkout.couponApplied") : couponResult.message}
          </p>
        )}

        <div className="flex flex-col gap-2 border-t border-stone-light pt-4 text-sm">
          <div className="flex justify-between">
            <span>{t("cart.subtotal")}</span>
            <span>{formatPrice(subtotal, locale)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-moss">
              <span>{t("checkout.discount")}</span>
              <span>-{formatPrice(discount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{t("checkout.shipping")}</span>
            <span>{shipping === 0 ? t("checkout.free") : formatPrice(shipping, locale)}</span>
          </div>
          <div className="flex justify-between border-t border-stone-light pt-2 font-display text-base">
            <span>{t("checkout.total")}</span>
            <span>{formatPrice(total, locale)}</span>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-clay">{error}</p>}

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={isPending}>
          {isPending ? t("checkout.placingOrder") : t("checkout.confirmOrder")}
        </Button>
      </div>
    </form>
  );
}
