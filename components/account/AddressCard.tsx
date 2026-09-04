"use client";

import { useState } from "react";
import { deleteAddressAction, setDefaultAddressAction } from "@/lib/actions/account";
import { EditAddressForm } from "@/components/account/EditAddressForm";
import { useLocale } from "@/lib/i18n/LocaleContext";

type Address = {
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

export function AddressCard({ address }: { address: Address }) {
  const [editing, setEditing] = useState(false);
  const { t } = useLocale();

  return (
    <div className="border border-stone-light p-4 text-sm">
      <div className="flex items-start justify-between">
        <div>
          <p>
            {address.full_name} — {address.phone}
          </p>
          <p className="mt-1 text-stone">
            {address.full_address}، {address.city}، {address.governorate}
          </p>
        </div>
        {address.is_default && (
          <span className="border border-ink px-2 py-1 text-xs">{t("account.default")}</span>
        )}
      </div>

      {editing ? (
        <EditAddressForm address={address} onDone={() => setEditing(false)} />
      ) : (
        <div className="mt-3 flex gap-4 text-xs">
          <button onClick={() => setEditing(true)} className="underline">
            {t("common.edit")}
          </button>
          {!address.is_default && (
            <form
              action={async () => {
                await setDefaultAddressAction(address.id);
              }}
            >
              <button className="underline">{t("account.setDefault")}</button>
            </form>
          )}
          <form
            action={async () => {
              await deleteAddressAction(address.id);
            }}
          >
            <button className="text-clay underline">{t("common.remove")}</button>
          </form>
        </div>
      )}
    </div>
  );
}
