import { z } from 'zod'

// Profile update validation
export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Ad soyad en az 2 karakter olmalı')
    .max(50, 'Ad soyad en fazla 50 karakter olmalı')
    .regex(/^[a-zA-ZğüşıöçĞÜŞIÖÇ\s]+$/, 'Ad soyad sadece harf ve boşluk içerebilir'),
  avatar_url: z
    .string()
    .url('Geçerli bir URL olmalı')
    .optional()
    .or(z.literal('')),
})

// Workout plan creation validation
export const createWorkoutPlanSchema = z.object({
  goal: z.enum(['muscle', 'weight_loss', 'endurance', 'general'], {
    message: 'Geçersiz hedef seçimi',
  }),
  level: z.enum(['beginner', 'intermediate', 'advanced'], {
    message: 'Geçersiz seviye seçimi',
  }),
  daysPerWeek: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 3 && val <= 6, {
      message: 'Haftada 3-6 gün olmalı',
    }),
  duration: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 30 && val <= 120, {
      message: 'Süre 30-120 dakika arasında olmalı',
    }),
  equipment: z
    .array(z.string())
    .min(1, 'En az bir ekipman seçmelisiniz'),
  notes: z
    .string()
    .max(500, 'Notlar en fazla 500 karakter olabilir')
    .optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type CreateWorkoutPlanInput = z.infer<typeof createWorkoutPlanSchema>

