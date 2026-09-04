"use client";

import { useState, useTransition } from "react";
import { updateSettingAction } from "@/lib/actions/shipping";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SettingInput({
  settingKey,
  label,
  defaultValue,
}: {
  settingKey: string;
  label: string;
  defaultValue: number;
}) {
  const [value, setValue] = useState(String(defaultValue));
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await updateSettingAction(settingKey, Number(value));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="flex items-end gap-3">
      <div className="w-56">
        <Input
          label={label}
          name={settingKey}
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button size="sm" variant="secondary" onClick={handleSave} disabled={isPending}>
        {isPending ? "..." : saved ? "تم الحفظ ✓" : "حفظ"}
      </Button>
    </div>
  );
}
