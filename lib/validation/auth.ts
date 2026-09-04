import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "الاسم لازم يكون حرفين على الأقل"),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح"),
  phone: z
    .string()
    .trim()
    .min(8, "رقم الهاتف غير صحيح")
    .max(20, "رقم الهاتف غير صحيح"),
  password: z.string().min(8, "كلمة المرور لازم تكون 8 حروف على الأقل"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
