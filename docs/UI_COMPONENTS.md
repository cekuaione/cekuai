# 🎨 UI Components Library

## Overview

This document provides comprehensive documentation for all UI components in the CEKUAI project, including both shared components and sport-specific chat components.

---

## Table of Contents
1. [Shared Components](#shared-components)
2. [Chat Components](#chat-components)
3. [Design Tokens](#design-tokens)
4. [Usage Examples](#usage-examples)

---

## Shared Components

### Button
**File:** `components/ui/button.tsx`

**Purpose:** Primary button component with variants

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
```

**Variants:**
- `default` - Primary action (blue gradient)
- `destructive` - Destructive action (red)
- `outline` - Secondary action (outlined)
- `secondary` - Tertiary action (gray)
- `ghost` - Text button
- `link` - Link-style button

**Usage:**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
```

---

### Card
**File:** `components/ui/card.tsx`

**Purpose:** Container component for grouped content

**Components:**
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content
- `CardFooter` - Footer section

**Usage:**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Workout Plan</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your workout plan content here</p>
  </CardContent>
</Card>
```

---

### Input
**File:** `components/ui/input.tsx`

**Purpose:** Text input field

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: string;
}
```

**Usage:**
```tsx
import { Input } from '@/components/ui/input';

<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

---

### Label
**File:** `components/ui/label.tsx`

**Purpose:** Form label component

**Props:**
```typescript
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}
```

**Usage:**
```tsx
import { Label } from '@/components/ui/label';

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

---

### Select
**File:** `components/ui/select.tsx`

**Purpose:** Dropdown select component

**Components:**
- `Select` - Main component
- `SelectTrigger` - Trigger button
- `SelectValue` - Display value
- `SelectContent` - Dropdown content
- `SelectItem` - Individual option

**Usage:**
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

### Checkbox
**File:** `components/ui/checkbox.tsx`

**Purpose:** Checkbox input

**Props:**
```typescript
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}
```

**Usage:**
```tsx
import { Checkbox } from '@/components/ui/checkbox';

<Checkbox id="terms" />
<Label htmlFor="terms">Accept terms</Label>
```

---

### Radio Group
**File:** `components/ui/radio-group.tsx`

**Purpose:** Radio button group

**Components:**
- `RadioGroup` - Main component
- `RadioGroupItem` - Individual radio button

**Usage:**
```tsx
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

<RadioGroup defaultValue="option1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="option1" />
    <Label htmlFor="option1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="option2" />
    <Label htmlFor="option2">Option 2</Label>
  </div>
</RadioGroup>
```

---

### Textarea
**File:** `components/ui/textarea.tsx`

**Purpose:** Multi-line text input

**Props:**
```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  rows?: number;
}
```

**Usage:**
```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea placeholder="Enter text..." rows={4} />
```

---

### Avatar
**File:** `components/ui/avatar.tsx`

**Purpose:** User avatar component

**Components:**
- `Avatar` - Main component
- `AvatarImage` - Image source
- `AvatarFallback` - Fallback text

**Usage:**
```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

---

### Badge
**File:** `components/ui/badge.tsx`

**Purpose:** Status badge component

**Props:**
```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}
```

**Usage:**
```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Failed</Badge>
```

---

### Dropdown Menu
**File:** `components/ui/dropdown-menu.tsx`

**Purpose:** Dropdown menu component

**Components:**
- `DropdownMenu` - Main component
- `DropdownMenuTrigger` - Trigger button
- `DropdownMenuContent` - Menu content
- `DropdownMenuItem` - Menu item
- `DropdownMenuLabel` - Menu label
- `DropdownMenuSeparator` - Separator

**Usage:**
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Tabs
**File:** `components/ui/tabs.tsx`

**Purpose:** Tabbed interface component

**Components:**
- `Tabs` - Main component
- `TabsList` - Tab buttons container
- `TabsTrigger` - Individual tab button
- `TabsContent` - Tab content

**Usage:**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

---

### Tooltip
**File:** `components/ui/tooltip.tsx`

**Purpose:** Tooltip component

**Components:**
- `Tooltip` - Main component
- `TooltipTrigger` - Trigger element
- `TooltipContent` - Tooltip content

**Usage:**
```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

<Tooltip>
  <TooltipTrigger>Hover me</TooltipTrigger>
  <TooltipContent>
    <p>Tooltip text</p>
  </TooltipContent>
</Tooltip>
```

---

## Chat Components

### ChatContainer
**File:** `app/sport/workout-plan/components/chat-container.tsx`

**Purpose:** Main wrapper for chat interface

**Props:**
```typescript
interface ChatContainerProps {
  children: ReactNode;
}
```

**Features:**
- Fixed header with assistant title and contextual subtitle
- Scrollable messages area that auto-scrolls to newest content
- Pure black canvas matching external reference design

**Color Scheme:**
- **Page Background:** `bg-[#050505]`
- **Header:** `bg-[#0b0b0b]/95` with `border-[#121212]`
- **Chat Surface:** Transparent—bubbles float directly on the page background

**Scroll Behavior:**
- Messages appear at bottom
- New messages push old messages up
- User stays at bottom, sees new messages immediately
- Uses `flex-col justify-end` for proper alignment

**Usage:**
```tsx
import { ChatContainer } from './components/chat-container';

<ChatContainer>
  {/* Chat messages and components */}
</ChatContainer>
```

---

### MessageBubble
**File:** `app/sport/workout-plan/components/message-bubble.tsx`

**Purpose:** Display AI and user messages

**Props:**
```typescript
interface MessageBubbleProps {
  type: 'ai' | 'user';
  content: string;
  showAvatar?: boolean;
}
```

**Features:**
- Left-aligned AI messages (cyan → blue gradient)
- Right-aligned user messages (purple → magenta gradient)
- Avatar display (configurable)
- Smooth fade-in animation
- Avatar grouping for consecutive messages

**Color Scheme:**
- **AI Bubbles:** `bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500`
- **User Bubbles:** `bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500`
- **Text:** Pure white for maximum contrast

**Avatar Grouping:**
- Avatar (💪) shows only on first AI message in a group
- Consecutive AI messages don't show avatar
- Avatar reappears after user response
- User messages always show avatar (👤)

**Usage:**
```tsx
import { MessageBubble } from './components/message-bubble';

<MessageBubble
  type="ai"
  content="Hello! How can I help you?"
  showAvatar={true}
/>

<MessageBubble
  type="user"
  content="I want to create a workout plan"
  showAvatar={true}
/>

<MessageBubble
  type="ai"
  content="Great! Let's get started."
  showAvatar={false} // No avatar for consecutive AI message
/>
```

---

### TypingIndicator
**File:** `app/sport/workout-plan/components/typing-indicator.tsx`

**Purpose:** Show AI is typing

**Features:**
- Three bouncing dots animation
- Matches AI message styling
- 1-2 second delay before message

**Usage:**
```tsx
import { TypingIndicator } from './components/typing-indicator';

{isTyping && <TypingIndicator />}
```

---

### QuickReplies
**File:** `app/sport/workout-plan/components/quick-replies.tsx`

**Purpose:** Quick reply buttons for selections

**Props:**
```typescript
interface QuickRepliesProps {
  options: string[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
  selectedValues?: string[];
  onSubmit?: (selected: string[]) => void;
}
```

**Features:**
- 2-column mobile, 4-column desktop
- Single or multi-select mode
- Active state with purple glow
- Disabled after selection (single-select mode)
- Continue button for multi-select mode

**Multi-Select Mode:**
- Shows checkmark (✓) on selected items
- Sticky "✓ Devam Et" button appears at bottom
- Button shows count of selected items
- Button disabled until at least 1 item selected
- Full-width on mobile, centered on desktop

**Button Styling:**
- Purple gradient: `from-purple-600 to-pink-600`
- Shadow: `shadow-purple-600/50`
- Fixed bottom position
- Responsive width

**Usage:**
```tsx
import { QuickReplies } from './components/quick-replies';

// Single-select mode
<QuickReplies
  options={['Option 1', 'Option 2', 'Option 3']}
  onSelect={(value) => console.log(value)}
/>

// Multi-select mode with continue button
<QuickReplies
  options={['Item 1', 'Item 2', 'Item 3']}
  onSelect={() => {}}
  multiSelect
  selectedValues={selected}
  onSubmit={(selected) => handleSubmit(selected)}
/>
```

---

### SummaryCard
**File:** `app/sport/workout-plan/components/summary-card.tsx`

**Purpose:** Display user's selections before confirmation

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

**Features:**
- Icon-based list format
- Purple gradient border
- Compact, readable design
- Shows all 6 categories

**Usage:**
```tsx
import { SummaryCard } from './components/summary-card';

<SummaryCard
  goal="💪 Kas Yapma"
  level="🌱 Yeni Başlayan"
  daysPerWeek="3"
  duration="60"
  equipment={['Dumbbell', 'Barbell']}
  notes="No injuries"
/>
```

---

### ChatInputPlaceholder
**File:** `app/sport/workout-plan/components/chat-input-placeholder.tsx`

**Purpose:** Fixed bottom input placeholder for future text input feature

**Features:**
- Fixed bottom position with subtle blur
- Disabled state for MVP (read-only preview)
- Rounded input capsule aligned with reference UI
- Cyan/blue gradient send button
- Smooth slide-up animation
- Additional helper copy below the field

**Props:**
```typescript
// No props - pure presentational component
```

**Usage:**
```tsx
import { ChatInputPlaceholder } from './components/chat-input-placeholder';

<ChatInputPlaceholder />
```

**Styling:**
- Background: `bg-[#0b0b0b]/95` with backdrop blur
- Border: `border-t border-[#151515]`
- Input Capsule: `border border-[#1f1f1f] bg-[#111111]` with rounded-full layout
- Button: `bg-gradient-to-br from-blue-500 to-cyan-500` (disabled with `opacity-60`)
- Helper Text: `text-xs text-slate-600` centered under the field

---

### ChatTextInput
**File:** `app/sport/workout-plan/components/chat-text-input.tsx`

**Purpose:** WhatsApp-style text input for notes

**Props:**
```typescript
interface ChatTextInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}
```

**Features:**
- Sticky bottom position
- Auto-resizing textarea
- Character counter (500 max)
- Enter to send, Shift+Enter for new line
- Purple gradient submit button

**Usage:**
```tsx
import { ChatTextInput } from './components/chat-text-input';

<ChatTextInput
  onSubmit={(text) => handleSubmit(text)}
  placeholder="Type your message..."
  maxLength={500}
/>
```

---

## Design Tokens

### Colors

#### Primary Palette
```css
--blue-50: #eff6ff;
--blue-100: #dbeafe;
--blue-500: #3b82f6;
--blue-600: #2563eb;
--blue-700: #1d4ed8;
--blue-800: #1e40af;
--blue-900: #1e3a8a;
```

#### Secondary Palette
```css
--purple-50: #faf5ff;
--purple-100: #f3e8ff;
--purple-500: #a855f7;
--purple-600: #9333ea;
--purple-700: #7e22ce;
--purple-800: #6b21a8;
--purple-900: #581c87;
```

#### Neutral Palette
```css
--slate-50: #f8fafc;
--slate-100: #f1f5f9;
--slate-200: #e2e8f0;
--slate-300: #cbd5e1;
--slate-400: #94a3b8;
--slate-500: #64748b;
--slate-600: #475569;
--slate-700: #334155;
--slate-800: #1e293b;
--slate-900: #0f172a;
```

### Typography

#### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

#### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing

#### Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Border Radius

```css
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;   /* Full circle */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

## Usage Examples

### Complete Chat Interface
```tsx
import { ChatContainer } from './components/chat-container';
import { MessageBubble } from './components/message-bubble';
import { TypingIndicator } from './components/typing-indicator';
import { QuickReplies } from './components/quick-replies';

export function ChatPage() {
  return (
    <ChatContainer>
      <MessageBubble
        type="ai"
        content="Hello! How can I help you?"
      />
      
      <MessageBubble
        type="user"
        content="I want to create a workout plan"
      />
      
      <TypingIndicator />
      
      <QuickReplies
        options={['Option 1', 'Option 2']}
        onSelect={(value) => console.log(value)}
      />
    </ChatContainer>
  );
}
```

### Form with Validation
```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  return (
    <form>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Email" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Password" />
      </div>
      
      <Button type="submit">Sign In</Button>
    </form>
  );
}
```

---

## Related Documentation
- [SPORT_FEATURE.md](./SPORT_FEATURE.md) - Feature documentation
- [CHANGELOG.md](./CHANGELOG.md) - Version history

---

**Last Updated:** January 18, 2025 (v1.1.1)
