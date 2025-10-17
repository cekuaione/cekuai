'use server'

import { getSupabaseUserClient, getSupabaseServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth-helpers'
import { actionRateLimiter } from '@/lib/rate-limit'
import * as Sentry from '@sentry/nextjs'
import { updateProfileSchema } from '@/lib/validations/user'

export async function updateProfile(formData: FormData) {
  // Verify authentication
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  // Rate limiting
  const { success } = await actionRateLimiter.limit(session.user.id)
  if (!success) {
    throw new Error('Çok fazla istek. Lütfen bekleyin.')
  }
  
  // Validate input
  const rawData = {
    full_name: formData.get('full_name'),
    avatar_url: formData.get('avatar_url'),
  }
  
  const validation = updateProfileSchema.safeParse(rawData)
  if (!validation.success) {
    const firstError = validation.error.issues[0]
    throw new Error(firstError?.message || 'Geçersiz veri')
  }
  
  // Use session user ID, NOT form data (prevents impersonation)
  const userId = session.user.id
  const { full_name, avatar_url } = validation.data
  
  // Use user client - RLS will ensure user can only update their own profile
  const supabase = await getSupabaseUserClient()
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, full_name, avatar_url: avatar_url || null })
  if (error) {
    Sentry.captureException(error, { tags: { action: 'updateProfile' } })
    throw new Error(error.message)
  }
  revalidatePath('/dashboard/settings')
}

export async function requestEmailChange(formData: FormData) {
  // Verify authentication
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  
  // Placeholder: Implement via Supabase auth email change or NextAuth adapter logic
  console.log('Requested email change to', formData.get('email'))
}

export async function deleteAccount() {
  // Verify authentication
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  // Rate limiting
  const { success } = await actionRateLimiter.limit(session.user.id)
  if (!success) {
    throw new Error('Çok fazla istek. Lütfen bekleyin.')
  }
  
  const userId = session.user.id
  
  try {
    // 1. Delete user-related data (use user client - RLS enforced)
    const userSupabase = await getSupabaseUserClient()
    const { error: plansErr } = await userSupabase.from('workout_plans').delete().eq('user_id', userId)
    if (plansErr) throw new Error(plansErr.message)
    
    // 2. Delete profile (use user client - RLS enforced)
    const { error: profileErr } = await userSupabase.from('profiles').delete().eq('id', userId)
    if (profileErr) throw new Error(profileErr.message)
    
    // 3. Delete auth user (requires service role key - admin operation)
    const serviceSupabase = getSupabaseServiceClient()
    const { error: authErr } = await serviceSupabase.auth.admin.deleteUser(userId)
    if (authErr) throw new Error(authErr.message)
    
    return { success: true }
  } catch (error) {
    Sentry.captureException(error, { tags: { action: 'deleteAccount' } })
    throw error
  }
}

