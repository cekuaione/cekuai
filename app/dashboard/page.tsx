import Link from 'next/link'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export default async function DashboardHomePage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  const supabase = getSupabaseServiceClient()
  let totalPlans = 0
  let activePlans = 0
  let lastActivity: string | null = null
  let recentPlans: { id: string; goal: string; level: string; is_active: boolean | null; updated_at: string | null }[] = []

  const { data, error } = await supabase
    .from('workout_plans')
    .select('id, goal, level, is_active, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (!error && data) {
    totalPlans = data.length
    activePlans = data.filter((p) => p.is_active).length
    lastActivity = data[0]?.updated_at ?? null
    recentPlans = data.slice(0, 5)
  } else if (error) {
    console.error('Failed to load workout plans for dashboard', { userId, message: error.message })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Hoş geldin{session?.user?.name ? `, ${session.user.name}` : ''}</h1>
          <p className="mt-2 text-gray-400">Gününe hareket katmaya hazır mısın?</p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/sport/workout-plan">+ Yeni Plan Oluştur</Link>
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Planlarım</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPlans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Aktif Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activePlans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Son Aktivite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">{lastActivity ? new Date(lastActivity).toLocaleString() : '—'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Son Planlar</h2>
          <Button asChild variant="ghost" size="sm"><Link href="/dashboard/plans">Tümünü Gör</Link></Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recentPlans.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">Henüz plan bulunmuyor.</CardContent>
            </Card>
          ) : (
            recentPlans.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-base">{p.goal}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <div>Seviye: {p.level}</div>
                  <div>Durum: {p.is_active ? 'Aktif' : 'Arşiv'}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
