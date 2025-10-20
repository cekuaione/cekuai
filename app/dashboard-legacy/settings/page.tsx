import { getSupabaseUserClient } from '@/lib/supabase/server'
import { auth } from '@/lib/auth-helpers'
import { SettingsForm } from './settings-form'

export const dynamic = 'force-dynamic'

async function getProfile() {
  const supabase = await getSupabaseUserClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ?? { full_name: '', avatar_url: null as string | null }
}

export default async function SettingsPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null
  
  const email = session.user.email ?? ''
  const profile = await getProfile()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Ayarlar</h1>
        <p className="mt-2 text-text-secondary">Hesap bilgilerinizi ve tercihlerinizi yönetin</p>
      </div>
      <SettingsForm 
        userId={userId}
        email={email}
        fullName={profile.full_name ?? ''}
        avatarUrl={profile.avatar_url}
      />
    </div>
  )
}

