"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { createCategoryAction } from "@/lib/actions/products";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? "جارٍ الإضافة..." : "إضافة فئة"}
    </Button>
  );
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function CategoryForm() {
  const [state, formAction] = useFormState(createCategoryAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-4"
    >
      <div className="w-56">
        <Input
          ref={nameRef}
          label="اسم الفئة"
          name="name"
          required
          onChange={(e) => {
            if (slugRef.current && !slugRef.current.dataset.touched) {
              slugRef.current.value = slugify(e.target.value);
            }
          }}
        />
      </div>
      <div className="w-56">
        <Input
          label="English name (optional)"
          name="nameEn"
        />
      </div>
      <div className="w-56">
        <Input
          ref={slugRef}
          label="الرابط (بالإنجليزي)"
          name="slug"
          required
          onChange={(e) => {
            e.target.dataset.touched = "true";
          }}
        />
      </div>
      <SubmitButton />
      {state?.error && (
        <p role="alert" className="text-sm text-clay">
          {state.error}
        </p>
      )}
    </form>
  );
}
