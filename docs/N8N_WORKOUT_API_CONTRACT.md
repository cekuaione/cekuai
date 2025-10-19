# N8N Workout Plan API Contract

## Overview

This document describes the API contract for the n8n workflow that generates AI-powered workout plans using OpenAI and ExerciseDB.

**Technology Stack:**
- **n8n**: Workflow automation platform
- **OpenAI**: AI-powered workout plan generation
- **ExerciseDB**: Exercise database with images and instructions
- **Supabase**: Database storage

**Purpose:** Generate personalized workout plans based on user goals, fitness level, and available equipment.

---

## 1. Webhook Input (Request Format)

### Endpoint
```
POST https://cekuai.duckdns.org/webhook-test/workout-plan-generate
```

### Headers
```http
Content-Type: application/json
```

### Request Body
```json
{
  "userId": "string (UUID)",
  "planId": "string (UUID)",
  "goal": "muscle" | "weight_loss" | "endurance" | "general_fitness",
  "level": "beginner" | "intermediate" | "advanced",
  "daysPerWeek": 3 | 4 | 5 | 6,
  "durationPerDay": 30 | 45 | 60 | 90,
  "equipment": ["dumbbell", "barbell", "kettlebell", "resistance_band", "pullup_bar", "bodyweight"],
  "notes": "string (optional)"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string (UUID) | Yes | User's unique identifier |
| `planId` | string (UUID) | Yes | Plan's unique identifier (must exist in database) |
| `goal` | enum | Yes | Workout goal: `muscle`, `weight_loss`, `endurance`, `general_fitness` |
| `level` | enum | Yes | Fitness level: `beginner`, `intermediate`, `advanced` |
| `daysPerWeek` | number | Yes | Number of training days per week (3-6) |
| `durationPerDay` | number | Yes | Minutes per training session (30, 45, 60, 90) |
| `equipment` | array | Yes | Available equipment list |
| `notes` | string | No | Special requirements or notes |

---

## 2. Webhook Output (Response Format)

### Success Response
```json
{
  "success": true,
  "planId": "string (UUID)",
  "message": "Plan oluşturuldu!"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "planId": "string (UUID)"
}
```

---

## 3. Supabase Update (What Gets Saved)

The workflow updates the `workout_plans` table with the following structure:

### Database Record
```json
{
  "id": "2104ef32-a898-4fd0-8616-36b7b424712c",
  "user_id": "55d4bd61-8e66-4b6c-8a08-733a97b8e921",
  "goal": "muscle",
  "level": "beginner",
  "days_per_week": 3,
  "duration_per_day": 60,
  "equipment": ["dumbbell", "barbell"],
  "notes": "",
  "plan_data": {
    "weeks": [
      {
        "label": "Hafta 1",
        "days": [
          {
            "day": "Pazartesi",
            "title": "Gün 1",
            "focus": "Üst Vücut",
            "summary": "Göğüs ve kol egzersizleri",
            "exercises": [
              {
                "name": "Decline Push-Up",
                "sets": "3x10",
                "rest": "90 saniye",
                "target": "Göğüs",
                "notes": "Dumbbell kullanma, düzgün formda yapmaya dikkat et",
                "imageUrl": "https://cdn.exercisedb.dev/w/images/RKnSv6J/41n2hGUso7JFmuYR__Decline-Push-Up-m_chest.png"
              },
              {
                "name": "Dumbbell Incline One Arm Hammer Press",
                "sets": "3x12",
                "rest": "90 saniye",
                "target": "Üst Kol (Biceps, Triceps)",
                "notes": "Dumbbell ile yap, kontrollü hareket et",
                "imageUrl": "https://cdn.exercisedb.dev/w/images/iFeKp3f/41n2haNJ3NA8yCE2__Dumbbell-Incline-One-Arm-Hammer-Press_Upper-Arms.png"
              }
            ]
          },
          {
            "day": "Salı",
            "title": "Gün 2",
            "focus": "Alt Vücut",
            "summary": "Bacak ve kalça egzersizleri",
            "exercises": [
              {
                "name": "Dumbbell Stiff Leg Deadlift",
                "sets": "3x12",
                "rest": "90 saniye",
                "target": "Kalçalar ve Hamstrings",
                "notes": "Dumbbell ile yap, sırtı dik tut",
                "imageUrl": "https://cdn.exercisedb.dev/w/images/ep9ZHO7/41n2hcw2FN534HcA__Dumbbell-Stiff-Leg-Deadlift_Waist.png"
              },
              {
                "name": "Dumbbell Single Leg Calf Raise",
                "sets": "3x15",
                "rest": "60 saniye",
                "target": "Baldırlar",
                "notes": "Dumbbell ile yap, kontrollü hareket et",
                "imageUrl": "https://cdn.exercisedb.dev/w/images/M7P04gJ/41n2hbLX4XH8xgN7__Dumbbell-Single-Leg-Calf-Raise_Calves.png"
              }
            ]
          },
          {
            "day": "Çarşamba",
            "title": "Gün 3",
            "focus": "Core & Karın",
            "summary": "Karın ve bel kaslarını güçlendirme",
            "exercises": [
              {
                "name": "Elbows Back Stretch",
                "sets": "3x12",
                "rest": "60 saniye",
                "target": "Göğüs, Sırt",
                "notes": "Derin nefes al, esneme hareketine odaklan",
                "imageUrl": "https://cdn.exercisedb.dev/w/images/F99SEwF/41n2hKZmyYXB2UL4__Elbows-Back-Stretch-(male)_Chest.png"
              }
            ]
          }
        ]
      }
    ]
  },
  "is_active": true,
  "created_at": "2025-10-17T22:25:22.815695+00:00",
  "updated_at": "2025-10-17T22:25:22.815695+00:00"
}
```

---

## 4. TypeScript Interfaces

### Core Interfaces

```typescript
// Exercise interface
interface WorkoutExercise {
  name: string;
  sets: string;
  rest: string;
  target: string;
  notes?: string;
  imageUrl?: string;
}

// Day interface
interface WorkoutDay {
  day: string;
  title: string;
  focus: string;
  summary: string;
  exercises: WorkoutExercise[];
}

// Week interface
interface WorkoutWeek {
  label: string;
  days: WorkoutDay[];
}

// Plan Data interface
interface PlanData {
  weeks: WorkoutWeek[];
}

// Full Workout Plan interface
interface WorkoutPlan {
  id: string;
  user_id: string;
  goal: string;
  level: string;
  days_per_week: number;
  duration_per_day: number;
  equipment: string[];
  notes: string | null;
  plan_data: PlanData;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Webhook Request interface
interface WorkoutPlanRequest {
  userId: string;
  planId: string;
  goal: "muscle" | "weight_loss" | "endurance" | "general_fitness";
  level: "beginner" | "intermediate" | "advanced";
  daysPerWeek: 3 | 4 | 5 | 6;
  durationPerDay: 30 | 45 | 60 | 90;
  equipment: string[];
  notes?: string;
}

// Webhook Response interface
interface WorkoutPlanResponse {
  success: boolean;
  planId: string;
  message: string;
  error?: string;
}
```

---

## 5. Example cURL Command

### Test Webhook
```bash
curl -X POST https://cekuai.duckdns.org/webhook-test/workout-plan-generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "59c36833-2ee7-411a-bb91-16b37a4d9807",
    "planId": "5dff12b0-09d7-4de9-8c69-98b521c5e768",
    "goal": "muscle",
    "level": "beginner",
    "daysPerWeek": 3,
    "durationPerDay": 60,
    "equipment": ["dumbbell", "barbell"],
    "notes": "Gerçek test - planId ve userId ile"
  }'
```

### Production Webhook
```bash
curl -X POST ${N8N_WEBHOOK_URL} \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "59c36833-2ee7-411a-bb91-16b37a4d9807",
    "planId": "5dff12b0-09d7-4de9-8c69-98b521c5e768",
    "goal": "muscle",
    "level": "beginner",
    "daysPerWeek": 3,
    "durationPerDay": 60,
    "equipment": ["dumbbell", "barbell"],
    "notes": "Production test"
  }'
```

---

## 6. Usage Notes

### Prerequisites
1. **planId must exist** in the database before calling the webhook
2. The plan should be created with `status: 'generating'` and `plan_data: null`
3. User must be authenticated (userId must be valid)

### Workflow Process
1. **Frontend** submits form → creates empty plan → gets planId
2. **API** fires webhook asynchronously (doesn't wait for response)
3. **n8n** receives request → generates workout plan (10-30 seconds)
4. **n8n** updates Supabase with generated plan_data
5. **n8n** updates plan status to 'ready'
6. **Frontend** polls or uses WebSocket to check when plan is ready

### Status Flow
```
generating → ready
     ↓
  (if error)
     ↓
   failed
```

### Timing
- **AI Generation**: 10-30 seconds
- **ExerciseDB Image Fetch**: 2-5 seconds per exercise
- **Total**: 15-40 seconds depending on number of exercises

### Error Handling
- If webhook fails, plan status is set to `failed`
- Frontend should show error message and allow retry
- Check server logs for detailed error information

### Frontend Implementation
```typescript
// 1. Create plan
const response = await fetch('/api/workout/plans', {
  method: 'POST',
  body: JSON.stringify(formData)
});
const { planId } = await response.json();

// 2. Poll for completion
const pollPlan = async () => {
  const res = await fetch(`/api/workout/plans?id=${planId}`);
  const { plan } = await res.json();
  
  if (plan.status === 'ready') {
    // Redirect to result page
    router.push(`/sport/workout-plan/result?id=${planId}`);
  } else if (plan.status === 'failed') {
    // Show error
    setError('Plan oluşturulamadı');
  } else {
    // Still generating, poll again
    setTimeout(pollPlan, 2000);
  }
};

pollPlan();
```

### Image URLs
- All exercise images are hosted on `cdn.exercisedb.dev`
- Images are high-quality PNG format
- URLs are stable and don't expire
- Next.js Image component should be configured with this domain

### Data Validation
- All exercises include: name, sets, rest, target
- Optional fields: notes, imageUrl
- Turkish language for day names and summaries
- English for exercise names (from ExerciseDB)

---

## 7. Testing

### Test Checklist
- [ ] Webhook receives correct payload
- [ ] planId is included in payload
- [ ] Supabase update succeeds
- [ ] plan_data structure is valid JSON
- [ ] All exercises have required fields
- [ ] Image URLs are accessible
- [ ] Status changes from 'generating' to 'ready'
- [ ] Error handling works for failed webhooks

### Test Scenarios
1. **Happy Path**: All fields provided, valid equipment
2. **Minimal Data**: Only required fields
3. **No Equipment**: Empty equipment array
4. **Special Notes**: User has injuries or restrictions
5. **Different Goals**: Test all goal types
6. **Different Levels**: Test all fitness levels

---

## 8. Troubleshooting

### Common Issues

**Issue**: Webhook returns 404
- **Solution**: Activate workflow in n8n by clicking "Execute workflow"

**Issue**: planId not found
- **Solution**: Ensure plan exists in database before calling webhook

**Issue**: plan_data is null
- **Solution**: Check n8n logs for AI generation errors

**Issue**: Images not loading
- **Solution**: Add `cdn.exercisedb.dev` to Next.js image domains

**Issue**: Status stuck on 'generating'
- **Solution**: Check n8n workflow execution status

---

## 9. Changelog

### Version 1.0.0 (2025-10-17)
- Initial API contract documentation
- Based on real n8n workflow output
- Includes all exercise fields and image URLs
- TypeScript interfaces generated from actual data

---

## 10. Support

For issues or questions:
- Check n8n workflow logs
- Review server console logs
- Verify Supabase database records
- Test with provided cURL commands

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-10-17  
**Author**: Ceku.ai Development Team

