import { z } from "zod";

export const productBasicSchema = z.object({
  name: z.string().trim().min(2, "اسم المنتج قصير جدًا"),
  nameEn: z.string().trim().optional(),
  slug: z
    .string()
    .trim()
    .min(2, "الرابط قصير جدًا")
    .regex(/^[a-z0-9-]+$/, "الرابط يجب أن يحتوي حروف إنجليزية صغيرة وأرقام وشرطات فقط"),
  categoryId: z.string().uuid().nullable().optional(),
  description: z.string().trim().optional(),
  descriptionEn: z.string().trim().optional(),
  material: z.string().trim().optional(),
  materialEn: z.string().trim().optional(),
  careInstructions: z.string().trim().optional(),
  careInstructionsEn: z.string().trim().optional(),
  basePrice: z.coerce.number().min(0, "السعر لا يمكن أن يكون سالبًا"),
  compareAtPrice: z.coerce.number().min(0).nullable().optional(),
  status: z.enum(["active", "draft", "archived"]),
  isFeatured: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  isBestSeller: z.coerce.boolean().optional(),
});

export const variantInputSchema = z.object({
  colorId: z.string().uuid(),
  sizeId: z.string().uuid(),
  sku: z.string().trim().min(1, "الـ SKU مطلوب"),
  quantity: z.coerce.number().int().min(0),
  priceOverride: z.coerce.number().min(0).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const measurementInputSchema = z.object({
  sizeId: z.string().uuid(),
  chestCm: z.coerce.number().min(0).nullable().optional(),
  shoulderCm: z.coerce.number().min(0).nullable().optional(),
  lengthCm: z.coerce.number().min(0).nullable().optional(),
  sleeveCm: z.coerce.number().min(0).nullable().optional(),
});

export const imageInputSchema = z.object({
  url: z.string().url(),
  sortOrder: z.number().int().min(0),
});

export const productFormSchema = z.object({
  basic: productBasicSchema,
  variants: z.array(variantInputSchema).min(1, "أضف متغير واحد على الأقل (لون/مقاس)"),
  measurements: z.array(measurementInputSchema).default([]),
  images: z.array(imageInputSchema).default([]),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;
