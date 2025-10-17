import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseUserClient } from '@/lib/supabase/server'
import { apiRateLimiter } from '@/lib/rate-limit'
import { createWorkoutPlanSchema } from '@/lib/validations/user'

type WorkoutPlanData = {
  weeks: Array<{
    label: string
    days: Array<{
      day: string
      title: string
      focus: string
      summary: string
      exercises: Array<{
        name: string
        sets: string
        rest: string
        target: string
      }>
    }>
  }>
}

const templates: Record<
  string,
  Array<{
    focus: string
    summary: string
    exercises: Array<{
      name: string
      sets: string
      rest: string
      target: string
    }>
  }>
> = {
  muscle: [
    {
      focus: 'Üst Vücut Gücü',
      summary: 'Göğüs, sırt ve omuz odaklı kuvvet çalışması',
      exercises: [
        { name: 'Bench Press', sets: '4 x 8', rest: '90 sn', target: 'Göğüs, Omuz' },
        { name: 'Barbell Row', sets: '4 x 10', rest: '75 sn', target: 'Sırt, Biceps' },
        { name: 'Overhead Press', sets: '3 x 10', rest: '75 sn', target: 'Omuz' },
      ],
    },
    {
      focus: 'Alt Vücut Gücü',
      summary: 'Bacak ve kalça odaklı temel hareketler',
      exercises: [
        { name: 'Back Squat', sets: '4 x 8', rest: '90 sn', target: 'Quadriceps, Kalça' },
        { name: 'Romanian Deadlift', sets: '3 x 10', rest: '75 sn', target: 'Hamstring, Kalça' },
        { name: 'Walking Lunge', sets: '3 x 12', rest: '60 sn', target: 'Quadriceps' },
      ],
    },
    {
      focus: 'Çekiş & Kol',
      summary: 'Sırt ve kol kaslarını destekleyici rutin',
      exercises: [
        { name: 'Pull-up', sets: '4 x 6', rest: '90 sn', target: 'Sırt, Biceps' },
        { name: 'Dumbbell Row', sets: '3 x 12', rest: '60 sn', target: 'Sırt' },
        { name: 'Hammer Curl', sets: '3 x 12', rest: '60 sn', target: 'Biceps' },
      ],
    },
  ],
  weight_loss: [
    {
      focus: 'Tüm Vücut Kardiyo',
      summary: 'Kalori yakımını artıran yüksek tempolu egzersizler',
      exercises: [
        { name: 'Rowing Machine', sets: '4 x 5 dk', rest: '60 sn', target: 'Tüm Vücut' },
        { name: 'Mountain Climbers', sets: '3 x 45 sn', rest: '45 sn', target: 'Core, Kardiyo' },
        { name: 'Burpees', sets: '3 x 15', rest: '60 sn', target: 'Full Body' },
      ],
    },
    {
      focus: 'Fonksiyonel Güç',
      summary: 'Yağ yakımını destekleyen kombinasyon hareketleri',
      exercises: [
        { name: 'Kettlebell Swing', sets: '4 x 15', rest: '60 sn', target: 'Kalça, Kardiyo' },
        { name: 'TRX Row', sets: '3 x 12', rest: '45 sn', target: 'Sırt' },
        { name: 'Goblet Squat', sets: '4 x 12', rest: '60 sn', target: 'Quadriceps, Kalça' },
      ],
    },
    {
      focus: 'Metabolik Kondisyon',
      summary: 'Devre sistemi ile dayanıklılık geliştirme',
      exercises: [
        { name: 'Battle Rope', sets: '4 x 30 sn', rest: '45 sn', target: 'Üst Vücut, Kardiyo' },
        { name: 'Box Jump', sets: '3 x 12', rest: '60 sn', target: 'Bacak, Patlayıcı Güç' },
        { name: 'Assault Bike', sets: '4 x 40 sn', rest: '80 sn', target: 'Full Body' },
      ],
    },
  ],
  endurance: [
    {
      focus: 'Temel Dayanıklılık',
      summary: 'Aerobik kapasiteyi artıran sabit tempo',
      exercises: [
        { name: 'Koşu Bandı', sets: '1 x 30 dk', rest: 'Dinlenme yok', target: 'Kardiyo' },
        { name: 'Core Plank', sets: '3 x 60 sn', rest: '45 sn', target: 'Core' },
        { name: 'Jump Rope', sets: '4 x 2 dk', rest: '45 sn', target: 'Kardiyo' },
      ],
    },
    {
      focus: 'Intervall Çalışma',
      summary: 'VO2 max geliştiren yüksek/orta tempo aralıklı çalışma',
      exercises: [
        { name: 'Interval Running', sets: '10 x 1 dk hızlı / 1 dk düşük', rest: 'Dinlenme yok', target: 'Kardiyo' },
        { name: 'Bodyweight Squat', sets: '4 x 20', rest: '45 sn', target: 'Bacak' },
        { name: 'Russian Twist', sets: '4 x 20', rest: '45 sn', target: 'Core' },
      ],
    },
    {
      focus: 'Fonksiyonel Dayanıklılık',
      summary: 'Tüm vücut dayanıklılığını destekleyen kombinasyon',
      exercises: [
        { name: 'Farmer Carry', sets: '4 x 40 m', rest: '60 sn', target: 'Grip, Full Body' },
        { name: 'Box Step-up', sets: '4 x 15', rest: '60 sn', target: 'Bacak, Kardiyo' },
        { name: 'Push-up', sets: '4 x 15', rest: '45 sn', target: 'Göğüs, Omuz' },
      ],
    },
  ],
  general: [
    {
      focus: 'Mobilite & Aktivasyon',
      summary: 'Düşük etkili hazırlık ve aktivasyon hareketleri',
      exercises: [
        { name: 'Dynamic Stretch', sets: '10 dk', rest: 'Dinlenme yok', target: 'Full Body' },
        { name: 'Glute Bridge', sets: '4 x 15', rest: '45 sn', target: 'Kalça' },
        { name: 'Resistance Band Row', sets: '3 x 15', rest: '45 sn', target: 'Sırt' },
      ],
    },
    {
      focus: 'Fonksiyonel Kombinasyon',
      summary: 'Günlük hayatta kullanılan hareket kalıpları',
      exercises: [
        { name: 'Dumbbell Deadlift', sets: '4 x 12', rest: '60 sn', target: 'Posterior Chain' },
        { name: 'Overhead Squat', sets: '3 x 12', rest: '60 sn', target: 'Full Body' },
        { name: 'Push Press', sets: '3 x 12', rest: '60 sn', target: 'Omuz, Core' },
      ],
    },
    {
      focus: 'Kondisyon & Core',
      summary: 'Temel güç ve kondisyon dengesini korur',
      exercises: [
        { name: 'Row Machine', sets: '3 x 8 dk', rest: '75 sn', target: 'Full Body' },
        { name: 'Plank Variations', sets: '4 x 45 sn', rest: '30 sn', target: 'Core' },
        { name: 'Medicine Ball Slam', sets: '4 x 12', rest: '45 sn', target: 'Full Body' },
      ],
    },
  ],
}

function buildPlanData(input: { goal: string; daysPerWeek: number }): WorkoutPlanData {
  const template = templates[input.goal] ?? templates.general
  const daysPerWeek = Math.min(input.daysPerWeek, 6)
  const availableDays = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  const selectedDays = availableDays.slice(0, daysPerWeek)

  return {
    weeks: Array.from({ length: 4 }).map((_, weekIdx) => ({
      label: `Hafta ${weekIdx + 1}`,
      days: selectedDays.map((day, dayIdx) => {
        const templateIndex = (dayIdx + weekIdx) % template.length
        const templateDay = template[templateIndex]
        return {
          day,
          title: `${day} - ${templateDay.focus}`,
          focus: templateDay.focus,
          summary: templateDay.summary,
          exercises: templateDay.exercises,
        }
      }),
    })),
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting
  const identifier = session.user.id
  const { success } = await apiRateLimiter.limit(identifier)
  if (!success) {
    return NextResponse.json({ error: 'Çok fazla istek. Lütfen bekleyin.' }, { status: 429 })
  }

  const json = await req.json().catch(() => null)
  const parsed = createWorkoutPlanSchema.safeParse(json)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return NextResponse.json(
      { error: firstError?.message || 'Validation failed' },
      { status: 400 }
    )
  }

  const payload = parsed.data
  const supabase = await getSupabaseUserClient()
  const planData = buildPlanData(payload)

  const { data, error } = await supabase
    .from('workout_plans')
    .insert({
      user_id: session.user.id,
      goal: payload.goal,
      level: payload.level,
      days_per_week: payload.daysPerWeek,
      duration_per_day: payload.duration,
      equipment: payload.equipment,
      notes: payload.notes ?? null,
      plan_data: planData,
      is_active: true,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[WorkoutPlan][POST] Supabase insert failed:', error?.message)
    const err = new Error(`Failed to save workout plan: ${error?.message}`)
    err.name = 'WorkoutPlanSaveError'
    throw err
  }

  return NextResponse.json({ id: data.id })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing plan id' }, { status: 400 })
  }

  const supabase = await getSupabaseUserClient()
  const { data, error } = await supabase
    .from('workout_plans')
    .select(
      'id, user_id, goal, level, days_per_week, duration_per_day, equipment, notes, plan_data, is_active, created_at, updated_at'
    )
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('[WorkoutPlan][GET] Fetch failed:', error?.message)
    const err = new Error(`Failed to fetch workout plan: ${error?.message}`)
    err.name = 'WorkoutPlanFetchError'
    throw err
  }

  if (data.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  const plan = {
    id: data.id,
    goal: data.goal,
    level: data.level,
    daysPerWeek: data.days_per_week,
    durationPerDay: data.duration_per_day,
    equipment: Array.isArray(data.equipment) ? data.equipment : [],
    notes: data.notes,
    planData: data.plan_data as WorkoutPlanData,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }

  return NextResponse.json({ plan })
}
