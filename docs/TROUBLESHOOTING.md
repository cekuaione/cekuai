# 🔧 Troubleshooting Guide

## Overview

This document provides solutions to common issues encountered in the CEKUAI project, including debugging commands, log locations, and resolution steps.

---

## Table of Contents
1. [Common Issues](#common-issues)
2. [Debug Commands](#debug-commands)
3. [Log Locations](#log-locations)
4. [Database Issues](#database-issues)
5. [API Issues](#api-issues)
6. [Authentication Issues](#authentication-issues)
7. [Performance Issues](#performance-issues)

---

## Common Issues

### Issue: Application Won't Start

#### Symptoms
- `npm run dev` fails
- Port already in use error
- Module not found errors

#### Solutions

**Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**Module Not Found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

**TypeScript Errors**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix auto-fixable errors
npx tsc --noEmit --fix
```

---

### Issue: User Messages Not Showing in Chat

#### Symptoms
- Only AI messages visible in chat
- User selections don't appear as bubbles
- Chat seems one-sided

#### Solutions

**Check MessageBubble Component**
```typescript
// Ensure user messages are being added
addMessage("user", selectedValue);

// Verify MessageBubble receives correct props
<MessageBubble
  type="user"
  content={message.content}
  showAvatar={true}
/>
```

**Check Handler Functions**
```typescript
// All selection handlers should add user message
const handleGoalSelect = (goal: string) => {
  addMessage("user", goal);  // Add this line
  selectOption("goal", goal);
};
```

**Check Avatar Grouping Logic**
```typescript
// shouldShowAvatar function should return true for user messages
const shouldShowAvatar = (index: number) => {
  if (messages[index].type === "user") return true;
  // ... rest of logic
};
```

**Verify User Bubble Styling**
```typescript
// User bubbles should have distinct styling
className="bg-gradient-to-br from-purple-600/30 to-pink-600/20"
```

---

### Issue: Chat Scrolls the Wrong Direction

#### Symptoms
- New messages push the conversation downward instead of staying pinned to the bottom
- Users must scroll manually to see latest responses
- Auto-scroll feels jumpy or inconsistent

#### Solutions

**Anchor List to Bottom**
```tsx
// ChatContainer keeps messages anchored with flex + justify-end
<div className="flex h-full flex-col justify-end gap-4">
  {children}
</div>
```

**Smooth Auto-Scroll**
```tsx
const childCount = useMemo(() => Children.count(children), [children]);

useEffect(() => {
  if (!scrollRef.current) return;
  scrollRef.current.scrollTo({
    top: scrollRef.current.scrollHeight,
    behavior: "smooth",
  });
}, [childCount]);
```

**Provide Room for Fixed Footer**
```tsx
// Prevent bottom UI from overlapping the last message
className="overflow-y-auto px-4 py-6 pb-40"
```

---

### Issue: Dark Theme Bubbles Are Unreadable

#### Symptoms
- AI/user bubbles blend into background
- Low contrast text on dark backgrounds
- Chat container lacks visual separation from page

#### Solutions

**High-Contrast Bubble Styling**
```tsx
const aiClasses =
  "border border-blue-500/25 bg-blue-900/40 text-slate-100";
const userClasses =
  "border border-purple-500/30 bg-purple-900/40 text-slate-100";
```

**Upgrade Avatars & Shadows**
```tsx
<div className="rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md" />
```

**Differentiate Container from Page**
```tsx
<div className="rounded-3xl border border-slate-800/60 bg-slate-900/80 shadow-2xl" />
```

**Align Footer Styling**
```tsx
className="fixed bottom-0 bg-slate-950/90 border-t border-slate-800/60"
```

---

### Issue: JSX Comment Syntax Error

#### Symptoms
- Build fails with error: "Expected '</', got '{'"
- TypeScript/ESLint error on JSX comment
- Page won't compile

#### Solutions

**Problem:** JSX comments inside JSX expressions must be properly formatted

**Incorrect Syntax:**
```tsx
{isAI && !showAvatar && (
  <div className="flex-shrink-0 w-8 h-8" /> {/* Spacer for alignment */}
)}
```

**Correct Syntax (Option 1 - Move comment outside):**
```tsx
{/* Spacer for alignment when avatar is hidden */}
{isAI && !showAvatar && (
  <div className="flex-shrink-0 w-8 h-8" />
)}
```

**Correct Syntax (Option 2 - Remove comment):**
```tsx
{isAI && !showAvatar && (
  <div className="flex-shrink-0 w-8 h-8" />
)}
```

**Correct Syntax (Option 3 - Proper formatting):**
```tsx
{isAI && !showAvatar && (
  <>
    <div className="flex-shrink-0 w-8 h-8" />
    {/* Spacer for alignment */}
  </>
)}
```

---

### Issue: addMessage Not Defined Error

#### Symptoms
- Runtime error: "Can't find variable: addMessage"
- Error occurs when selecting options in chat
- User messages don't appear

#### Solutions

**Problem:** `addMessage` function not destructured from `useChatFlow` hook

**Check Hook Export:**
```typescript
// use-chat-flow.ts should export addMessage
return {
  messages,
  currentStep,
  formData,
  isTyping,
  addMessage,  // Must be included
  selectOption,
  confirmAndGenerate,
  startEdit,
};
```

**Fix Page Destructuring:**
```typescript
// page.tsx - Add addMessage to destructuring
const {
  messages,
  currentStep,
  formData,
  isTyping,
  addMessage,  // Add this line
  selectOption,
  confirmAndGenerate,
  startEdit,
} = useChatFlow();
```

**Verify Handler Functions:**
```typescript
// All handlers should call addMessage
const handleGoalSelect = (goal: string) => {
  addMessage("user", goal);  // Must be called
  selectOption("goal", goal);
};
```

---

### Issue: Notes Quick Reply Buttons Not Showing

#### Symptoms
- Notes question appears but buttons are missing
- User stuck at notes step
- Flow doesn't continue

#### Solutions

**Problem:** Conditional check prevents buttons from showing

**Incorrect Code:**
```tsx
{currentStep === "notes" && formData.notes === "" && (
  <QuickReplies ... />
)}
```

**Correct Code:**
```tsx
{currentStep === "notes" && (
  <QuickReplies ... />
)}
```

**Explanation:**
- Remove the `formData.notes === ""` check
- Buttons should show whenever `currentStep === "notes"`
- User selection will update formData

---

### Issue: Scroll Direction Wrong (Messages Scroll Down)

#### Symptoms
- New messages appear at top
- User must scroll down to see new messages
- Opposite of expected behavior (Claude/ChatGPT)

#### Solutions

**Problem:** Messages container doesn't use proper flexbox alignment

**Incorrect Code:**
```tsx
<div className="container mx-auto max-w-2xl space-y-2">
  {children}
</div>
```

**Correct Code:**
```tsx
<div className="container mx-auto max-w-2xl bg-slate-900/80 rounded-xl border border-slate-800/50">
  <div className="flex flex-col justify-end min-h-full p-6 space-y-2">
    {children}
  </div>
</div>
```

**Explanation:**
- Use `flex flex-col justify-end` to align content to bottom
- Messages appear at bottom and scroll up
- Auto-scroll keeps user at bottom
- Matches Claude/ChatGPT behavior

---

### Issue: Build Fails

#### Symptoms
- `npm run build` fails
- TypeScript errors in build
- Missing environment variables

#### Solutions

**TypeScript Errors**
```bash
# Check for errors
npx tsc --noEmit

# Fix errors before building
# Update tsconfig.json if needed
```

**Missing Environment Variables**
```bash
# Check .env.local exists
ls -la .env.local

# Copy from example
cp .env.example .env.local

# Set required variables
# See API_INTEGRATION.md for list
```

**Memory Issues**
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

### Issue: Database Connection Failed

#### Symptoms
- "Database connection failed" error
- "Invalid credentials" error
- Timeout errors

#### Solutions

**Check Supabase Connection**
```bash
# Test connection
npx supabase status

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Verify Credentials**
```bash
# Check .env.local
cat .env.local | grep SUPABASE

# Update if needed
# Get from Supabase dashboard
```

**Network Issues**
```bash
# Test network connectivity
ping db.your-project.supabase.co

# Check firewall
sudo ufw status
```

---

### Issue: Authentication Not Working

#### Symptoms
- Can't sign in
- Session expires immediately
- Redirect loops

#### Solutions

**Check NextAuth Configuration**
```bash
# Verify NEXTAUTH_URL
echo $NEXTAUTH_URL

# Should match your domain
# http://localhost:3000 for dev
# https://your-domain.com for prod
```

**Check Session Secret**
```bash
# Verify NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# Generate new secret if needed
openssl rand -base64 32
```

**Clear Cookies**
```bash
# In browser:
# 1. Open DevTools (F12)
# 2. Application > Cookies
# 3. Delete all cookies for localhost
# 4. Refresh page
```

**Check Supabase Auth**
```bash
# Verify Supabase auth is enabled
# Check Supabase dashboard > Authentication > Settings
```

---

### Issue: API Endpoints Not Working

#### Symptoms
- 404 errors on API routes
- 500 internal server errors
- CORS errors

#### Solutions

**Check API Route Exists**
```bash
# Verify file structure
ls -la app/api/workout/plans/route.ts

# Check file exports
grep "export async function" app/api/workout/plans/route.ts
```

**Check CORS Configuration**
```bash
# In API route, add CORS headers:
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

**Check Rate Limiting**
```bash
# Verify Upstash credentials
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN

# Test Redis connection
curl $UPSTASH_REDIS_REST_URL/ping
```

---

### Issue: n8n Workflow Not Triggering

#### Symptoms
- Workflow doesn't start
- Timeout errors
- Invalid webhook URL

#### Solutions

**Check n8n URL**
```bash
# Verify N8N_URL is correct
echo $N8N_URL

# Test webhook
curl -X POST $N8N_URL/webhook/workout-plan \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Check n8n API Key**
```bash
# Verify N8N_API_KEY is set
echo $N8N_API_KEY

# Test API connection
curl -H "Authorization: Bearer $N8N_API_KEY" \
  $N8N_URL/api/v1/executions
```

**Check Workflow Status**
```bash
# In n8n dashboard:
# 1. Go to Workflows
# 2. Check workflow is active
# 3. Check webhook is enabled
# 4. Test webhook manually
```

---

## Debug Commands

### Application Debug

**Check Application Status**
```bash
# PM2
pm2 status
pm2 logs cekuai --lines 100

# Docker
docker ps
docker logs cekuai --tail 100

# Vercel
vercel logs --follow
```

**Check Node Version**
```bash
node --version
# Should be v20.x or higher
```

**Check npm Version**
```bash
npm --version
# Should be 10.x or higher
```

**Check Disk Space**
```bash
df -h
# Ensure adequate space available
```

**Check Memory Usage**
```bash
# PM2
pm2 monit

# Docker
docker stats

# System
free -h
```

---

### Database Debug

**Check Database Status**
```bash
# Supabase CLI
npx supabase status

# PostgreSQL
psql $DATABASE_URL -c "SELECT version();"
```

**Check Database Connections**
```bash
# Supabase
npx supabase db diff

# PostgreSQL
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

**Check Table Exists**
```bash
# List all tables
psql $DATABASE_URL -c "\dt"

# Check specific table
psql $DATABASE_URL -c "SELECT * FROM workout_plans LIMIT 1;"
```

**Check Database Size**
```bash
psql $DATABASE_URL -c "
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as database_size;
"
```

---

### Network Debug

**Check DNS Resolution**
```bash
nslookup your-domain.com
```

**Check SSL Certificate**
```bash
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

**Check HTTP Response**
```bash
curl -I https://your-domain.com
```

**Check API Response**
```bash
curl -X GET https://your-domain.com/api/health
```

---

## Log Locations

### Application Logs

**Next.js Dev Server**
```bash
# Console output
npm run dev

# Check terminal for errors
```

**PM2 Logs**
```bash
# Log directory
~/.pm2/logs/

# Error log
~/.pm2/logs/cekuai-error.log

# Output log
~/.pm2/logs/cekuai-out.log
```

**Docker Logs**
```bash
# Container logs
docker logs cekuai

# Follow logs
docker logs -f cekuai

# Last 100 lines
docker logs --tail 100 cekuai
```

**Vercel Logs**
```bash
# View logs
vercel logs

# Follow logs
vercel logs --follow

# Specific deployment
vercel logs [deployment-url]
```

---

### System Logs

**Nginx Logs**
```bash
# Access log
/var/log/nginx/access.log

# Error log
/var/log/nginx/error.log

# Follow logs
tail -f /var/log/nginx/error.log
```

**System Logs**
```bash
# Ubuntu/Debian
/var/log/syslog

# CentOS/RHEL
/var/log/messages

# Follow logs
tail -f /var/log/syslog
```

---

## Database Issues

### Connection Pool Exhausted

**Symptoms**
- "too many clients already" error
- Database connection timeouts

**Solutions**
```bash
# Check connection pool size
psql $DATABASE_URL -c "
SELECT count(*) FROM pg_stat_activity 
WHERE datname = current_database();
"

# Increase pool size in Supabase
# Dashboard > Settings > Database > Connection Pooling
```

---

### Slow Queries

**Symptoms**
- API responses slow
- Database queries timing out

**Solutions**
```bash
# Find slow queries
psql $DATABASE_URL -c "
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
"

# Add indexes
CREATE INDEX idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX idx_workout_plans_status ON workout_plans(status);
```

---

### Database Lock

**Symptoms**
- Queries hang
- "deadlock detected" error

**Solutions**
```bash
# Check for locks
psql $DATABASE_URL -c "
SELECT * FROM pg_locks 
WHERE NOT granted;
"

# Kill blocking queries
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE pid IN (
  SELECT pid FROM pg_locks WHERE NOT granted
);
```

---

## API Issues

### Rate Limiting

**Symptoms**
- "Too many requests" error
- 429 status code

**Solutions**
```bash
# Check rate limit configuration
# See API_INTEGRATION.md

# Increase limits if needed
# lib/rate-limit.ts
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'), // Increase from 10 to 20
});
```

---

### CORS Errors

**Symptoms**
- "CORS policy" error in browser
- API requests blocked

**Solutions**
```bash
# Add CORS headers in API route
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

---

## Authentication Issues

### Session Expires Too Quickly

**Symptoms**
- User logged out frequently
- Session invalid errors

**Solutions**
```bash
# Increase session max age
# lib/auth.ts
session: {
  maxAge: 30 * 24 * 60 * 60, // 30 days (increase from default)
}
```

---

### Email Verification Not Working

**Symptoms**
- Verification emails not sent
- Verification links don't work

**Solutions**
```bash
# Check Supabase email settings
# Dashboard > Authentication > Email Templates

# Check SMTP configuration
# Dashboard > Settings > Auth > SMTP Settings

# Test email sending
npx supabase auth test-email
```

---

## Performance Issues

### Slow Page Load

**Symptoms**
- Pages take > 3s to load
- High Time to First Byte (TTFB)

**Solutions**
```bash
# Check bundle size
npm run build
# Look for bundle size warnings

# Optimize images
# Use next/image component
# Compress images before upload

# Enable caching
# Add cache headers in next.config.ts
```

---

### High Memory Usage

**Symptoms**
- Application crashes
- Out of memory errors

**Solutions**
```bash
# Check memory usage
pm2 monit

# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" pm2 restart cekuai

# Or in ecosystem.config.js
max_memory_restart: '2G'
```

---

## Getting Help

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [n8n Documentation](https://docs.n8n.io)
- [Vercel Documentation](https://vercel.com/docs)

### Support Channels
- GitHub Issues: [Your Repository]
- Email: support@your-domain.com
- Discord: [Your Discord Server]

---

## Related Documentation
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment guide
- [API_INTEGRATION.md](./API_INTEGRATION.md) - API details
- [SPORT_FEATURE.md](./SPORT_FEATURE.md) - Feature documentation

---

**Last Updated:** January 18, 2025 (v1.1.1)
