# 📝 Changelog

All notable changes to the CEKUAI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **GitHub Secrets Integration - Enhanced deployment workflows**
  - Updated `.github/workflows/deploy.yml` with complete OCI secrets injection
  - Updated `.github/workflows/deploy-test.yml` with complete OCI secrets injection
  - Added OCI_ACCESS_KEY_ID, OCI_SECRET_ACCESS_KEY, OCI_ENDPOINT, OCI_BUCKET_NAME, OCI_REGION secrets
  - Added N8N_URL, N8N_API_KEY, N8N_SOCIAL_MEDIA_WEBHOOK_URL secrets
  - Enhanced .env file creation with all required environment variables
  - Added comprehensive GitHub Secrets documentation to README.md
  - Updated DEPLOYMENT_CHECKLIST.md with GitHub Secrets setup instructions
  - Documented automated deployment process and environment separation
  - Added complete secrets table with descriptions and examples
  - Implemented proper environment variable injection before Docker build step
- **Social Media Feature - Added project_type field**
  - Added ProjectType enum with text_to_image, image_to_image, image_to_video options
  - Added project_type field to all social media interfaces and types
  - Added project_type validation and helper functions
  - Updated database schema to include project_type field (NOT NULL)
  - Set fixed value "image_to_image" for current feature implementation
  - Updated n8n webhook payload to include projectType parameter
- **Landing Page - Added Social Media feature card**
  - Added Social Media feature card to marketing landing page
  - Positioned between Investing and Food categories for logical flow
  - Used purple/pink theme consistent with existing design patterns
  - Includes proper navigation to /dashboard/social-media
  - Features Turkish description: "AI görsel dönüşümü ve stil transferi araçları."
- **Upload API - Created temp image upload with OCI pre-signed URLs**
  - Added POST endpoint at `/api/upload/temp-image` for authenticated users
  - Supports file validation: max 10MB, JPEG/PNG/WebP/GIF only
  - Generates secure pre-signed URLs for direct OCI S3 uploads
  - Returns both upload and download URLs with 1-hour expiry
  - Includes filename sanitization and proper error handling
  - Uses existing OCI environment configuration
- **Social Media Feature - Created drag & drop image upload component**
  - Added ImageUpload component with dual input modes (URL and file upload)
  - Implemented full drag & drop functionality with visual feedback
  - Includes file validation, progress tracking, and error handling
  - Supports image preview and removal functionality
  - Integrated with OCI pre-signed URL upload system
  - Uses shadcn/ui components for consistent styling
- **Social Media Feature - Integrated ImageUpload into modal system**
  - Extended modal types to support custom components
  - Updated FeatureModal to render custom field components
  - Replaced text input with ImageUpload component in Social Media modal
  - Maintained existing form validation and error handling
  - Preserved modal structure and AI assistant integration
- **Social Media Feature - Enhanced ImageUpload URL validation**
  - Fixed URL tab validation to properly trigger onImageReady callback
  - Added automatic URL validation with HTTP/HTTPS protocol checking
  - Implemented auto-submission on blur and Enter key press
  - Removed confusing external link button from URL input
  - Added visual feedback for valid URL detection
  - Fixed form validation errors for URL inputs
  - Enhanced user experience with real-time validation feedback
- **Social Media Feature - Added external link preview for URL inputs**
  - Added external link button next to URL input field
  - Button appears only when valid HTTP/HTTPS URL is entered
  - Opens URL in new tab for preview before submission
  - Includes tooltip "Yeni sekmede aç" for better UX
  - Maintains clean layout with flex container design

### Fixed
- **Social Media Feature - Fixed status field constraint violation**
  - Updated ProjectStatus enum to match database CHECK constraint: pending, processing, completed, failed
  - Changed initial status from "generating" to "pending" in API and database operations
- **Social Media Feature - Fixed webhook not triggering in production**
  - Changed environment variable from NEXT_PUBLIC_N8N_SOCIAL_MEDIA_WEBHOOK_URL to N8N_SOCIAL_MEDIA_WEBHOOK_URL
  - Added fallback hardcoded URL for immediate webhook functionality
  - Enhanced logging for webhook debugging and troubleshooting
  - Fixed server-side environment variable access in API routes
- **Production Environment - Fixed localhost URL references**
  - Added missing NEXTAUTH_URL environment variable to deployment workflows
  - Updated Dockerfile and docker-compose.yml to include NEXTAUTH_URL
  - Fixed NextAuth redirect URLs to use production domain instead of localhost
  - Ensured proper environment variable configuration for production deployments
  - Updated status labels for proper Turkish localization
  - Fixed database insert operations to use correct status values
- **Social Media Feature - Fixed Next.js Image hostname error**
  - Added `unoptimized={true}` prop to input image display in project detail page
  - Allows external domain images without requiring hostname whitelist configuration
  - Output images continue using optimized Next.js Image component via API proxy
- **Social Media Feature - Fixed client component event handler error**
  - Created DownloadButton client component to handle download functionality
  - Extracted onClick handler from server component to prevent "Event handlers cannot be passed to Client Component props" error
  - Maintained server component architecture for project detail page

### Removed
- **Social Media Feature - Removed strength parameter**
  - Removed strength slider from social media transformation modal
  - Removed strength parameter from API request payload
  - Removed strength field from database schema and types
  - Updated n8n webhook payload to only include: userId, projectId, operationType, imageUrl
  - Simplified form flow by removing settings step
  - Fixed dashboard UI to remove strength display elements
  - Fixed API endpoints to remove strength from response payloads

### Changed
- **Dashboard route swap - NEW becomes default**
  - Moved NEW dashboard from `/new-dashboard` to `/dashboard` (now default)
  - Moved OLD dashboard from `/dashboard` to `/dashboard-legacy` (backup)
  - Updated all navigation links to use `/dashboard`
  - Updated auth redirects to point to `/dashboard`
  - Updated Sidebar navigation to use `/dashboard`
  - Updated result page links to use `/dashboard`
  - Updated modal onSuccess navigation to use `/dashboard`
  - OLD dashboard preserved at `/dashboard-legacy` for reference

### Added
- **NEW dashboard result pages**
  - Migrated workout plan result page to NEW dashboard system
  - Migrated crypto assessment result page to NEW dashboard system
  - Server-side data fetching for better performance
  - Consistent design with NEW dashboard style

### Fixed
- **Mobile "Keşfet" button navigation**
  - Fixed "En Çok Kullandığın Araçlar" section buttons
  - Workout Plan Generator now navigates to `/dashboard/sport`
  - Crypto Risk Assessment now navigates to `/dashboard/investing`
  - Fixed "Hızlı erişim" section links to use `/dashboard` paths
  - All buttons now work correctly on mobile devices

- **Crypto assessment result page - AI reasoning display**
  - Fixed "Piyasa Yorumu" section to display `assessment_data.reasoning`
  - Added fallback to `marketContext` for backward compatibility
  - Added placeholder text when reasoning is missing
  - Improved text formatting with `whitespace-pre-wrap` and `leading-relaxed`

- **Build errors - ESLint apostrophe escaping**
  - Fixed unescaped apostrophes in result page button text
  - Updated "Dashboard'a Dön" to use `&apos;` HTML entity
  - Fixed in both NEW dashboard and legacy result pages

- **Sport dashboard statistics accuracy**
  - Fixed "Toplam Plan" count to show all 77 plans (was filtering by status and showing 65)
  - Changed "Tamamlanan Antrenman" to "Yakında" (estimated calculation was incorrect)
  - Removed status filter from `getUserSportStats` to count all user plans

### Changed
- Major chat interface overhaul with dark blue/purple theme, high-contrast bubbles, and refined spacing.
- Chat container now anchors to bottom with smooth auto-scroll for new and existing messages.
- Quick reply buttons redesigned for mobile-first grid with persistent notes options and elevated multi-select action.
- Message avatars and bubbles updated with gradient badges and improved readability.
- Footer input placeholder refreshed to match new layout and maintain clear hierarchy.
- Chat experience restyled to reference design: pure black canvas, cyan AI bubbles, magenta user bubbles, and sleek fixed input bar.

### Planned
- Lottie animations for AI coach avatar
- TanStack Query integration for caching
- Voice input support for notes
- Image upload for workout references
- Conversation history and draft saving

---

## [1.1.1] - 2025-01-18

### Added
- **Bottom chat input placeholder**
  - Fixed bottom input box (disabled for MVP)
  - WhatsApp-style message input design
  - Placeholder text: "Metin girişi yakında eklenecek..."
  - Purple gradient send button (disabled)
  - Prevents overlap with messages (pb-20 padding)
  - Mobile responsive

### Changed
- **Improved visual hierarchy and contrast**
  - Page background: `bg-gradient-to-b from-slate-950 to-slate-900` (darker)
  - Chat container: `bg-slate-900/80` with rounded corners and border
  - Bubbles: Increased opacity and added shadows for better contrast
  - Clear visual distinction: Page → Chat Area → Bubbles

- **Color scheme optimization**
  - AI bubbles: Blue/cyan gradient with transparency for better visibility
  - User bubbles: Purple/pink gradient with enhanced contrast
  - Avatar gradients simplified for cleaner look
  - All text remains white for readability

- **Enlarged bottom input box**
  - Increased height from 60px to 100px
  - Larger input field (px-5 py-4)
  - Bigger send button (w-14 h-14)
  - More comfortable spacing for future text input

- **Fixed scroll direction**
  - Messages now scroll up (like Claude/ChatGPT)
  - New messages appear at bottom
  - User stays at bottom, sees new messages immediately
  - Uses `flex-col justify-end` for proper scroll behavior

### Fixed
- **Runtime error: addMessage not defined**
  - Added `addMessage` to destructured variables from `useChatFlow` hook
  - All handler functions now properly call `addMessage` before `selectOption`
  - User messages now appear correctly in chat
- **User selections now visible as chat bubbles**
  - User selections display as right-aligned purple/pink gradient bubbles
  - User avatar (👤) shows on all user messages
  - Selections appear immediately after clicking

- **Multi-select equipment has continue button**
  - Sticky "✓ Devam Et" button appears when items selected
  - Button shows count of selected items
  - Purple gradient styling with shadow
  - Full-width on mobile, centered on desktop

- **Improved color contrast**
  - AI bubbles: `bg-blue-900/20` with blue border
  - User bubbles: `bg-gradient-to-br from-purple-600/30 to-pink-600/20` with purple border
  - White text on both bubble types for readability

- **Removed timestamps**
  - Cleaner chat interface without timestamps
  - More WhatsApp-like appearance

- **Avatar grouping for AI messages**
  - Avatar (💪) shows only on first AI message in a group
  - Consecutive AI messages don't show avatar
  - Avatar reappears after user response

- **Reduced message spacing**
  - Changed from `gap-4` to `gap-2` for tighter spacing
  - More chat-like appearance
  - Better mobile experience

### Changed
- MessageBubble component now accepts `showAvatar` prop
- QuickReplies component now accepts `onSubmit` prop for multi-select
- ChatContainer spacing reduced for tighter layout

---

## [1.1.0] - 2025-01-18

### Added
- **Chat-based workout plan generation interface**
  - Complete WhatsApp-style conversational UI
  - 11-step guided conversation flow
  - Summary confirmation with edit capability
  - Notes text input with character counter
  - Edit flow system for changing selections

- **New Components**
  - `ChatContainer` - Full-height chat wrapper with fixed header
  - `MessageBubble` - AI/user message bubbles with animations
  - `TypingIndicator` - Animated bouncing dots
  - `QuickReplies` - Single/multi-select quick reply buttons
  - `SummaryCard` - Beautiful summary display with edit options
  - `ChatTextInput` - WhatsApp-style text input for notes

- **New Hooks**
  - `useChatFlow` - State machine for conversation flow

- **New Constants**
  - `AI_MESSAGES` - Turkish conversation copy
  - `USER_OPTIONS` - All user selection options

- **Documentation Structure**
  - Core documentation files in `/docs`
  - `.cursorrules` file for documentation discipline
  - Updated README.md with documentation index

### Changed
- **Workout Plan Page** (`app/sport/workout-plan/page.tsx`)
  - Complete rewrite from form-based to chat interface
  - Removed multi-step form UI
  - Added conversational flow with AI coach
  - Integrated all new chat components

- **Avatar Sizing**
  - Changed from `w-10 h-10` to `w-8 h-8` (32px)
  - Changed from gradient to solid `bg-blue-600`
  - Added `p-1` padding for better emoji display

### Technical Details
- **Conversation Flow Steps**
  1. Welcome - AI introduces itself
  2. Goal - User selects workout goal
  3. Level - User selects fitness level
  4. Days - User selects days per week
  5. Duration - User selects workout duration
  6. Equipment - User multi-selects equipment
  7. Notes - User selects "Yok" or writes custom note
  8. Summary - AI shows recap, user confirms or edits
  9. Generating - API call to create plan
  10. Result - Redirect to result page
  11. Edit - Navigate back to change selections

- **State Management**
  - Message array for chat history
  - Current step tracking
  - Form data object with all selections
  - Typing indicator state
  - Edit target tracking

- **Animations**
  - Message fade-in (300ms)
  - Typing indicator (600ms loop)
  - Button hover/tap effects
  - Summary scale-in (200ms)
  - Edit grid fade-in (300ms)

### Fixed
- Prevented duplicate messages with ref tracking
- Fixed avatar sizing consistency across components
- Fixed notes handling for "Yok" vs custom notes
- Fixed API data mapping for Turkish display names

---

## [1.0.0] - 2024-12-01

### Added
- **Initial Release**
  - Next.js 15 app with App Router
  - Supabase authentication
  - NextAuth.js integration
  - Workout plan generation API
  - n8n workflow integration
  - Dashboard for viewing plans
  - Settings page
  - Rate limiting with Upstash
  - Sentry error tracking

- **Authentication**
  - Email/password signup
  - Email verification
  - Sign in/Sign out
  - Protected routes

- **Workout Plan API**
  - POST `/api/workout/plans`
  - Polling for async plan generation
  - Error handling and retries
  - Fallback responses

- **Database Schema**
  - Users table
  - Workout_plans table
  - Workout_plan_exercises table

- **UI Components**
  - Button, Card, Input, Label
  - Select, Checkbox, Radio Group
  - Avatar, Badge, Dropdown Menu
  - Tabs, Textarea, Tooltip

---

## Version History

- **1.1.0** - Chat-based workout plan interface
- **1.0.0** - Initial release with basic features

---

**Last Updated:** January 18, 2025 (v1.1.1)
