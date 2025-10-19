# 🔌 API Integration Guide

## Overview

This document covers all API integrations in the CEKUAI project, including Supabase, n8n workflows, and internal Next.js API routes.

---

## Table of Contents
1. [Supabase Integration](#supabase-integration)
2. [n8n Workflow Integration](#n8n-workflow-integration)
3. [Internal API Routes](#internal-api-routes)
4. [Error Handling](#error-handling)
5. [Testing](#testing)

---

## Supabase Integration

### Authentication

#### Setup
```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
  return createClientComponentClient()
}
```

#### Server-side Client
```typescript
// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () => {
  return createServerComponentClient({ cookies })
}
```

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Workout Plans Table
```sql
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  level TEXT NOT NULL,
  days_per_week INTEGER NOT NULL,
  duration_per_day INTEGER NOT NULL,
  equipment TEXT[] NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  n8n_execution_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Workout Plan Exercises Table
```sql
CREATE TABLE workout_plan_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INTEGER,
  reps TEXT,
  weight TEXT,
  duration TEXT,
  rest_period TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## n8n Workflow Integration

### Overview
The n8n workflow handles AI-powered workout plan generation asynchronously.

### Workflow Contract

#### Request Format
```json
{
  "goal": "muscle",
  "level": "beginner",
  "daysPerWeek": 3,
  "durationPerDay": 60,
  "equipment": ["Dumbbell", "Barbell"],
  "notes": "No injuries"
}
```

#### Response Format
```json
{
  "success": true,
  "executionId": "abc123",
  "status": "pending"
}
```

#### Polling Response
```json
{
  "success": true,
  "status": "completed",
  "plan": {
    "id": "plan-uuid",
    "goal": "muscle",
    "level": "beginner",
    "daysPerWeek": 3,
    "durationPerDay": 60,
    "exercises": [
      {
        "day": 1,
        "exerciseName": "Bench Press",
        "sets": 3,
        "reps": "8-10",
        "weight": "Body weight",
        "duration": null,
        "restPeriod": "60 seconds",
        "notes": "Focus on form"
      }
    ]
  }
}
```

### API Endpoints

#### Start Workflow Execution
```bash
POST https://your-n8n-instance.com/webhook/workout-plan
Content-Type: application/json

{
  "goal": "muscle",
  "level": "beginner",
  "daysPerWeek": 3,
  "durationPerDay": 60,
  "equipment": ["Dumbbell", "Barbell"],
  "notes": "No injuries"
}
```

#### Check Execution Status
```bash
GET https://your-n8n-instance.com/api/v1/executions/{executionId}
Authorization: Bearer {n8n_api_key}
```

### Implementation

#### Start Workflow
```typescript
// lib/n8n.ts
export async function startWorkflow(data: WorkoutPlanRequest) {
  const response = await fetch(`${N8N_URL}/webhook/workout-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to start workflow');
  }

  return response.json();
}
```

#### Poll for Completion
```typescript
export async function pollWorkflowStatus(executionId: string) {
  const maxAttempts = 20;
  const delay = 2000; // 2 seconds

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(
      `${N8N_URL}/api/v1/executions/${executionId}`,
      {
        headers: {
          Authorization: `Bearer ${N8N_API_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (data.status === 'completed') {
      return data;
    }

    if (data.status === 'failed') {
      throw new Error('Workflow execution failed');
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error('Workflow timeout');
}
```

### Environment Variables
```env
N8N_URL=https://your-n8n-instance.com
N8N_API_KEY=your_n8n_api_key
```

---

## Internal API Routes

### POST /api/workout/plans

#### Purpose
Create a new workout plan by calling n8n workflow and storing result in Supabase.

#### Implementation
```typescript
// app/api/workout/plans/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { startWorkflow, pollWorkflowStatus } from '@/lib/n8n';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await rateLimit();
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Get authenticated user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { goal, level, daysPerWeek, duration, equipment, notes } = body;

    // Validate input
    if (!goal || !level || !daysPerWeek || !duration || !equipment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start n8n workflow
    const { executionId } = await startWorkflow({
      goal,
      level,
      daysPerWeek: parseInt(daysPerWeek),
      durationPerDay: parseInt(duration),
      equipment,
      notes: notes || '',
    });

    // Create workout plan record
    const { data: plan, error: planError } = await supabase
      .from('workout_plans')
      .insert({
        user_id: user.id,
        goal,
        level,
        days_per_week: parseInt(daysPerWeek),
        duration_per_day: parseInt(duration),
        equipment,
        notes: notes || '',
        status: 'pending',
        n8n_execution_id: executionId,
      })
      .select()
      .single();

    if (planError) {
      throw planError;
    }

    // Poll for completion
    const result = await pollWorkflowStatus(executionId);

    // Update plan with exercises
    const exercises = result.plan.exercises.map((exercise: any) => ({
      workout_plan_id: plan.id,
      ...exercise,
    }));

    await supabase
      .from('workout_plan_exercises')
      .insert(exercises);

    // Update plan status
    await supabase
      .from('workout_plans')
      .update({ status: 'completed' })
      .eq('id', plan.id);

    return NextResponse.json({
      success: true,
      planId: plan.id,
      status: 'completed',
    });

  } catch (error) {
    console.error('Workout plan creation failed:', error);
    
    return NextResponse.json(
      { error: 'Failed to create workout plan' },
      { status: 500 }
    );
  }
}
```

#### Request Example
```bash
curl -X POST http://localhost:3001/api/workout/plans \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=your_token" \
  -d '{
    "goal": "muscle",
    "level": "beginner",
    "daysPerWeek": "3",
    "duration": "60",
    "equipment": ["Dumbbell", "Barbell"],
    "notes": "No injuries"
  }'
```

#### Response Example
```json
{
  "success": true,
  "planId": "abc-123-def-456",
  "status": "completed"
}
```

### GET /api/workout/plans/[id]

#### Purpose
Retrieve a specific workout plan with all exercises.

#### Implementation
```typescript
// app/api/workout/plans/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get workout plan
    const { data: plan, error: planError } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Get exercises
    const { data: exercises, error: exercisesError } = await supabase
      .from('workout_plan_exercises')
      .select('*')
      .eq('workout_plan_id', params.id)
      .order('day');

    if (exercisesError) {
      throw exercisesError;
    }

    return NextResponse.json({
      success: true,
      plan: {
        ...plan,
        exercises,
      },
    });

  } catch (error) {
    console.error('Failed to retrieve workout plan:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve workout plan' },
      { status: 500 }
    );
  }
}
```

---

## Error Handling

### HTTP Status Codes
- **200 OK:** Successful request
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid input
- **401 Unauthorized:** Not authenticated
- **403 Forbidden:** Not authorized
- **404 Not Found:** Resource not found
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server error
- **503 Service Unavailable:** Service temporarily unavailable

### Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Error Handling Strategy
1. **Client-side validation** before API call
2. **Rate limiting** to prevent abuse
3. **Retry logic** for transient failures
4. **Fallback responses** for service unavailability
5. **User-friendly error messages** in Turkish

---

## Testing

### Manual Testing

#### Test Workout Plan Creation
```bash
# Start workflow
curl -X POST http://localhost:3001/api/workout/plans \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=your_token" \
  -d '{
    "goal": "muscle",
    "level": "beginner",
    "daysPerWeek": "3",
    "duration": "60",
    "equipment": ["Dumbbell", "Barbell"],
    "notes": ""
  }'
```

#### Test Plan Retrieval
```bash
# Get plan
curl http://localhost:3001/api/workout/plans/plan-id \
  -H "Cookie: sb-access-token=your_token"
```

### Automated Testing

#### Unit Tests
```typescript
// __tests__/api/workout/plans.test.ts
import { POST } from '@/app/api/workout/plans/route';

describe('POST /api/workout/plans', () => {
  it('should create a workout plan', async () => {
    const request = new Request('http://localhost/api/workout/plans', {
      method: 'POST',
      body: JSON.stringify({
        goal: 'muscle',
        level: 'beginner',
        daysPerWeek: '3',
        duration: '60',
        equipment: ['Dumbbell'],
        notes: '',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.planId).toBeDefined();
  });
});
```

---

## Rate Limiting

### Implementation
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
});

export async function rateLimit(identifier?: string) {
  const id = identifier || 'anonymous';
  const { success } = await ratelimit.limit(id);
  return { success };
}
```

### Limits
- **10 requests per hour** per user
- Sliding window algorithm
- Redis-backed storage

---

## Monitoring

### Sentry Integration
```typescript
// instrumentation.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### Logging
- API requests logged to console
- Errors sent to Sentry
- Performance metrics tracked

---

## Related Documentation
- [N8N_WORKOUT_API_CONTRACT.md](./N8N_WORKOUT_API_CONTRACT.md) - n8n workflow specification
- [SPORT_FEATURE.md](./SPORT_FEATURE.md) - Feature documentation
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Debug guide

---

**Last Updated:** January 18, 2025

