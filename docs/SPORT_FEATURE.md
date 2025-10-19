# 🏋️ Sport Feature - Workout Plan Generator

## Overview

The Sport feature provides an AI-powered conversational interface for generating personalized workout plans. Users interact with an AI coach through a WhatsApp-style chat interface to specify their fitness goals, level, schedule, and equipment availability.

---

## Architecture

### Technology Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS, Framer Motion, Radix UI
- **State Management:** React Hooks (useState, useEffect, useCallback)
- **Backend:** Next.js API Routes, Supabase, n8n workflows
- **Authentication:** NextAuth.js with Supabase adapter

### File Structure
```
app/sport/
├── page.tsx                    # Sport landing page
└── workout-plan/
    ├── page.tsx               # Main chat interface
    ├── result/
    │   └── page.tsx           # Plan result display
    ├── components/
    │   ├── chat-container.tsx
    │   ├── message-bubble.tsx
    │   ├── typing-indicator.tsx
    │   ├── quick-replies.tsx
    │   ├── summary-card.tsx
    │   └── chat-text-input.tsx
    ├── hooks/
    │   └── use-chat-flow.ts
    └── constants/
        └── ai-messages.ts
```

---

## User Journey

### 1. Entry Point
- User navigates to `/sport`
- Sees sport landing page with feature overview
- Clicks "Create Workout Plan" button
- Redirected to `/sport/workout-plan`

### 2. Chat Conversation Flow

```
┌─────────────────────────────────────────────────┐
│ Step 1: Welcome                                 │
│ AI: "Merhaba! Ben senin kişisel antrenman..."   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Step 2: Goal Selection                          │
│ Options: 💪 Kas Yapma | 🔥 Yağ Yakma | ...      │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Step 3: Level Selection                         │
│ Options: 🌱 Yeni Başlayan | 🏋️ Orta | ...       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Step 4: Days Per Week                           │
│ Options: 3 gün | 4 gün | 5 gün | 6 gün         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Step 5: Duration                                │
│ Options: 30 dk | 45 dk | 60 dk | 90 dk         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Step 6: Equipment (Multi-select)                │
│ Options: Dambıl | Barbell | Kettlebell | ...    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Step 7: Notes                                   │
│ Options: ❌ Yok | ✍️ Özel notum var             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Step 8: Summary & Confirmation                  │
│ Display all selections                          │
│ Options: ✓ Hepsi Tamam | ✏️ Düzenlemek         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Step 9: Generating                              │
│ AI: "Programını hazırlıyorum..."                │
│ API call to /api/workout/plans                  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Step 10: Result                                 │
│ Redirect to /sport/workout-plan/result?id=X     │
│ Display generated plan                          │
└─────────────────────────────────────────────────┘
```

### 3. Summary Confirmation
- After completing all steps, user sees summary
- AI message: "İşte seçimlerinin özeti. Onaylıyor musun?"
- SummaryCard displays all selections:
  - Goal, Level, Days per week, Duration, Equipment, Notes
- Two options:
  - "✓ Hepsi Tamam, Başlayalım!" - Confirm and generate plan
  - "✏️ Düzenlemek İstiyorum" - Edit selections (Phase 2)
- Edit options grid shows which section to change
- After edit, returns to summary

### 4. Edit Flow (Phase 2)
- User can click "✏️ Düzenlemek İstiyorum" at summary step
- Selects which section to edit (Goal, Level, Days, etc.)
- Navigates back to that step
- Re-selects option
- Returns to summary with updated data

---

## Components

### ChatContainer
**File:** `app/sport/workout-plan/components/chat-container.tsx`

**Purpose:** Main wrapper for chat interface

**Features:**
- Fixed header with back button
- Scrollable messages area
- Auto-scroll to bottom
- Dark gradient background

**Props:**
```typescript
interface ChatContainerProps {
  children: ReactNode;
}
```

### MessageBubble
**File:** `app/sport/workout-plan/components/message-bubble.tsx`

**Purpose:** Display AI and user messages

**Features:**
- Left-aligned AI messages (blue)
- Right-aligned user messages (purple)
- Avatar display
- Timestamp
- Smooth fade-in animation

**Props:**
```typescript
interface MessageBubbleProps {
  type: 'ai' | 'user';
  content: string;
  timestamp?: Date;
}
```

### TypingIndicator
**File:** `app/sport/workout-plan/components/typing-indicator.tsx`

**Purpose:** Show AI is typing

**Features:**
- Three bouncing dots animation
- Matches AI message styling
- 1-2 second delay before message

### QuickReplies
**File:** `app/sport/workout-plan/components/quick-replies.tsx`

**Purpose:** Quick reply buttons for selections

**Features:**
- 2-column mobile, 4-column desktop
- Single or multi-select mode
- Active state with purple glow
- Disabled after selection

**Props:**
```typescript
interface QuickRepliesProps {
  options: string[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
  selectedValues?: string[];
}
```

### SummaryCard
**File:** `app/sport/workout-plan/components/summary-card.tsx`

**Purpose:** Display user's selections before confirmation

**Features:**
- Icon-based list format
- Purple gradient border
- Compact, readable design
- Shows all 6 categories

**Props:**
```typescript
interface SummaryCardProps {
  goal: string;
  level: string;
  daysPerWeek: string;
  duration: string;
  equipment: string[];
  notes?: string;
}
```

### ChatTextInput
**File:** `app/sport/workout-plan/components/chat-text-input.tsx`

**Purpose:** WhatsApp-style text input for notes

**Features:**
- Sticky bottom position
- Auto-resizing textarea
- Character counter (500 max)
- Enter to send, Shift+Enter for new line
- Purple gradient submit button

**Props:**
```typescript
interface ChatTextInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}
```

---

## State Management

### useChatFlow Hook
**File:** `app/sport/workout-plan/hooks/use-chat-flow.ts`

**Purpose:** Manage conversation state and flow

**State:**
```typescript
{
  messages: Message[];           // Chat history
  currentStep: ConversationStep; // Current step
  formData: FormData;            // User selections
  isTyping: boolean;             // Typing indicator
}
```

**Methods:**
```typescript
{
  addMessage: (type, content) => void;
  selectOption: (field, value) => void;
  confirmAndGenerate: () => void;
  startEdit: (target) => void;
}
```

### Form Data Structure
```typescript
interface FormData {
  goal: string;              // e.g., "💪 Kas Yapma"
  level: string;             // e.g., "🌱 Yeni Başlayan"
  daysPerWeek: string;       // e.g., "3"
  duration: string;          // e.g., "60"
  equipment: string[];       // e.g., ["Dambıl", "Barbell"]
  notes: string;             // e.g., "Yok" or custom text
}
```

---

## API Integration

### Endpoint
`POST /api/workout/plans`

### Request Format
```typescript
{
  goal: "muscle" | "weight_loss" | "endurance" | "general",
  level: "beginner" | "intermediate" | "advanced",
  daysPerWeek: "3" | "4" | "5" | "6",
  duration: "30" | "45" | "60" | "90",
  equipment: string[],
  notes: string
}
```

### Response Format
```typescript
{
  success: boolean,
  planId: string,
  status: string,
  message: string
}
```

### Error Handling
- **503:** Service temporarily unavailable → Show retry message
- **400:** Bad request → Show validation error
- **500:** Server error → Show generic error

See [API_INTEGRATION.md](./API_INTEGRATION.md) for detailed API documentation.

---

## Design System

### Colors
- **Background:** `bg-gradient-to-br from-slate-900 to-slate-800`
- **AI Messages:** `bg-blue-900/30` with `border-blue-800/30`
- **User Messages:** `bg-purple-900/50` with `border-purple-800/30`
- **Active Buttons:** `bg-purple-600` with `shadow-purple-600/50`
- **Header:** `bg-slate-900/95` with backdrop blur

### Typography
- **AI Messages:** `text-base text-gray-100`
- **User Messages:** `text-base text-white`
- **Timestamps:** `text-xs text-gray-400`
- **Buttons:** `text-sm font-medium`

### Spacing
- **Message Gap:** `gap-4`
- **Button Gap:** `gap-2`
- **Container Padding:** `px-4 py-6`

### Animations
- **Message Entry:** Fade in + slide up (300ms)
- **Typing Indicator:** Bouncing dots (600ms loop)
- **Button Hover:** Scale 1.02
- **Button Tap:** Scale 0.98

---

## Accessibility

### WCAG Compliance
- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Visible focus indicators
- ✅ Touch targets minimum 44x44px
- ✅ Color contrast WCAG AA compliant
- ✅ Screen reader friendly

### Keyboard Shortcuts
- **Enter:** Send message (in text input)
- **Shift + Enter:** New line (in text input)
- **Tab:** Navigate between buttons

---

## Performance

### Optimizations
- **Conditional Rendering:** Only render active step
- **Memoization:** All functions use `useCallback`
- **Ref Tracking:** Prevents duplicate messages
- **Lazy Loading:** Components loaded on demand
- **CSS Animations:** Hardware-accelerated transforms

### Metrics
- **Initial Render:** < 100ms
- **Message Fade-in:** 300ms
- **Typing Indicator:** 600ms
- **Summary Scale-in:** 200ms
- **Edit Grid Fade-in:** 300ms

---

## Testing

### Manual Testing Checklist
- [x] All 11 conversation steps work sequentially
- [x] Quick replies functional with single/multi-select
- [x] Typing animation between messages
- [x] Auto-scroll to bottom works
- [x] Summary card displays correctly
- [x] Edit flow navigates to correct step
- [x] Text input appears when "Özel notum var" selected
- [x] Character counter works (500 max)
- [x] Enter to send, Shift+Enter for new line
- [x] API integration functional
- [x] Error handling works correctly
- [x] Mobile responsive (iPhone SE size)
- [x] Desktop responsive (1920px width)

### Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Future Enhancements

### Phase 2
- Lottie animations for AI coach avatar
- TanStack Query integration for caching
- Voice input support for notes
- Image upload for workout references
- Conversation history and draft saving

### Phase 3
- A/B testing for message copy
- Analytics and user journey tracking
- Multi-language support
- Offline mode with service worker
- Progressive Web App (PWA) features

---

## Related Documentation
- [API_INTEGRATION.md](./API_INTEGRATION.md) - API details
- [UI_COMPONENTS.md](./UI_COMPONENTS.md) - Component library
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [N8N_WORKOUT_API_CONTRACT.md](./N8N_WORKOUT_API_CONTRACT.md) - n8n workflow spec

---

**Last Updated:** January 18, 2025

