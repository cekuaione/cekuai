import Link from 'next/link'
import { getSupabaseUserClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { auth } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

async function getPlans() {
  const supabase = await getSupabaseUserClient()
  const { data, error } = await supabase
    .from('workout_plans')
    .select('id, goal, level, is_active, updated_at')
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export default async function PlansPage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  const plans = await getPlans()
  const active = plans.filter((p) => p.is_active)
  const archived = plans.filter((p) => !p.is_active)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Planlarım</h1>
          <p className="mt-2 text-gray-400">Tüm antrenman planlarınızı görüntüleyin ve yönetin</p>
        </div>
        <Button asChild size="lg">
          <Link href="/sport/workout-plan">+ Yeni Plan Oluştur</Link>
        </Button>
      </div>
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="archived">Arşiv</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.length === 0 ? (
              <Card><CardContent className="py-6 text-sm text-muted-foreground">Aktif plan yok.</CardContent></Card>
            ) : (
              active.map((p) => (
                <Card key={p.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{p.goal}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>Seviye: {p.level}</div>
                    <div className="flex gap-2">
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/dashboard/plans/${p.id}`}>Detay</Link>
                      </Button>
                      <Button variant="outline" size="sm">Düzenle</Button>
                      <form action="#">
                        <Button variant="destructive" size="sm" type="button">Sil</Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="archived">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {archived.length === 0 ? (
              <Card><CardContent className="py-6 text-sm text-muted-foreground">Arşivde plan yok.</CardContent></Card>
            ) : (
              archived.map((p) => (
                <Card key={p.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{p.goal}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>Seviye: {p.level}</div>
                    <div className="flex gap-2">
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/dashboard/plans/${p.id}`}>Detay</Link>
                      </Button>
                      <Button variant="outline" size="sm">Düzenle</Button>
                      <form action="#">
                        <Button variant="destructive" size="sm" type="button">Sil</Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

