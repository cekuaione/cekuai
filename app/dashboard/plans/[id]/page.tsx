import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth-helpers'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PlanData, WorkoutWeek as WorkoutWeekContract } from '@/lib/workout/types'

export const dynamic = 'force-dynamic'

type PlanRecord = {
  id: string
  goal: string
  level: string
  daysPerWeek: number | null
  durationPerDay: number | null
  equipment: string[]
  notes: string | null
  planData: PlanData
  isActive: boolean | null
  createdAt: string | null
  updatedAt: string | null
}

const goalLabels: Record<string, string> = {
  muscle: 'Kas Yapma',
  weight_loss: 'Kilo Verme',
  endurance: 'Dayanıklılık',
  general_fitness: 'Genel Fitness',
}

const levelLabels: Record<string, string> = {
  beginner: 'Yeni Başlayan',
  intermediate: 'Orta Seviye',
  advanced: 'İleri Seviye',
}

function isPlanData(value: unknown): value is PlanData {
  if (!value || typeof value !== 'object' || value === null) return false
  const candidate = value as { weeks?: unknown }
  return Array.isArray(candidate.weeks)
}

async function getPlan(planId: string, userId: string): Promise<PlanRecord | null> {
  const supabase = getSupabaseServiceClient()
  const { data, error } = await supabase
    .from('workout_plans')
    .select(
      'id, user_id, goal, level, days_per_week, duration_per_day, equipment, notes, plan_data, is_active, created_at, updated_at'
    )
    .eq('id', planId)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    if (error) {
      console.error('Failed to load workout plan detail', { planId, userId, message: error.message })
    }
    return null
  }

  return {
    id: data.id,
    goal: data.goal,
    level: data.level,
    daysPerWeek: data.days_per_week,
    durationPerDay: data.duration_per_day,
    equipment: Array.isArray(data.equipment) ? (data.equipment as string[]) : [],
    notes: data.notes,
    planData: isPlanData(data.plan_data) ? data.plan_data : { weeks: [] },
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const plan = await getPlan(id, session.user.id)
  if (!plan) {
    notFound()
  }

  const goal = goalLabels[plan.goal] ?? plan.goal
  const level = levelLabels[plan.level] ?? plan.level
  const equipment = plan.equipment.length > 0 ? plan.equipment : []
  const weeks = Array.isArray(plan.planData?.weeks) ? (plan.planData.weeks as WorkoutWeekContract[]) : []
  const normalizedWeeks = weeks
    .filter(Boolean)
    .map((week, index) => {
      const label = week?.label?.toString().trim() || `Hafta ${index + 1}`
      const days = Array.isArray(week?.days) ? week.days.filter(Boolean) : []
      return { label, days }
    })
  const defaultWeekValue = normalizedWeeks[0]?.label

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{goal}</h1>
          <p className="text-sm text-muted-foreground">
            Seviyesi {level} · {plan.daysPerWeek ?? '-'} gün/hafta · {plan.durationPerDay ?? '-'} dk/gün
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/plans">← Planlara Dön</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/sport/workout-plan">Yeni Plan Oluştur</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Özet</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm text-muted-foreground">Durum</span>
              <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                {plan.isActive ? 'Aktif' : 'Arşivde'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm text-muted-foreground">Son Güncelleme</span>
              <span className="text-sm font-medium">
                {plan.updatedAt ? new Date(plan.updatedAt).toLocaleString('tr-TR') : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm text-muted-foreground">Oluşturulma</span>
              <span className="text-sm font-medium">
                {plan.createdAt ? new Date(plan.createdAt).toLocaleString('tr-TR') : '-'}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg border border-border px-3 py-2">
              <p className="text-sm text-muted-foreground mb-2">Ekipmanlar</p>
              <div className="flex flex-wrap gap-2">
                {equipment.length === 0 ? (
                  <Badge variant="outline">Ekipman gerekmiyor</Badge>
                ) : (
                  equipment.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <div className="rounded-lg border border-border px-3 py-2">
              <p className="text-sm text-muted-foreground mb-2">Notlar</p>
              <p className="text-sm">{plan.notes ? plan.notes : 'Not eklenmemiş.'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Haftalık Program</CardTitle>
        </CardHeader>
        <CardContent>
          {normalizedWeeks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bu plan için detaylı program bilgisi bulunmuyor.</p>
          ) : (
            <Tabs defaultValue={defaultWeekValue}>
              <TabsList>
                {normalizedWeeks.map((week) => (
                  <TabsTrigger key={week.label} value={week.label}>
                    {week.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {normalizedWeeks.map((week) => {
                const value = week.label
                const days = week.days
                return (
                  <TabsContent key={value} value={value} className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      {days.length === 0 ? (
                        <Card className="border-dashed border-muted-foreground/40">
                          <CardContent className="py-10 text-center text-sm text-muted-foreground">
                            Bu hafta için gün eklenmemiş.
                          </CardContent>
                        </Card>
                      ) : (
                        days.map((day) => {
                          const exercises = Array.isArray(day?.exercises)
                            ? day?.exercises?.filter(Boolean)
                            : []
                          return (
                            <Card key={`${value}-${day?.day ?? 'gün'}`} className="border border-border/70">
                              <CardHeader className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge variant="secondary">{day?.day ?? 'Gün'}</Badge>
                                  <Badge>{day?.focus ?? 'Program'}</Badge>
                                </div>
                                <CardTitle className="text-base font-semibold">
                                  {day?.title ?? 'Antrenman'}
                                </CardTitle>
                                {day?.summary && (
                                  <p className="text-sm text-muted-foreground">{day.summary}</p>
                                )}
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {exercises.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">
                                    Bu gün için egzersiz eklenmemiş.
                                  </p>
                                ) : (
                                  exercises.map((exercise, idx) => (
                                    <div
                                      key={`${day?.day ?? idx}-exercise-${idx}`}
                                      className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{exercise?.name ?? 'Egzersiz'}</span>
                                        <span className="text-xs uppercase text-muted-foreground">
                                          {exercise?.sets ?? '-'}
                                        </span>
                                      </div>
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        Dinlenme: {exercise?.rest ?? '-'}
                                      </div>
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        Hedef: {exercise?.target ?? '-'}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </CardContent>
                            </Card>
                          )
                        })
                      )}
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
