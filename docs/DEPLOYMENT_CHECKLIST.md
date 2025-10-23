# 🚀 Deployment Checklist

## Overview

This document provides a comprehensive checklist for deploying the CEKUAI project to production, including pre-deployment, deployment, and post-deployment steps.

---

## Table of Contents
1. [Pre-Deployment](#pre-deployment)
2. [Deployment](#deployment)
3. [Post-Deployment](#post-deployment)
4. [Rollback Procedure](#rollback-procedure)
5. [Environment Configuration](#environment-configuration)

---

## Pre-Deployment

### Code Quality Checks
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings addressed
- [ ] No console.log statements in production code
- [ ] No debug breakpoints
- [ ] Code formatted with Prettier
- [ ] All TODOs documented or resolved

### Testing
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Manual testing completed
- [ ] Cross-browser testing done (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing done (iOS, Android)
- [ ] Accessibility testing completed (WCAG AA)

### Documentation
- [ ] CHANGELOG.md updated with new version
- [ ] README.md updated if needed
- [ ] API documentation updated
- [ ] Component documentation updated
- [ ] Deployment notes documented

### Security
- [ ] Environment variables reviewed
- [ ] No secrets in code
- [ ] API keys rotated if needed
- [ ] Dependencies updated (npm audit)
- [ ] Security headers configured
- [ ] CORS settings verified

### Database
- [ ] Database migrations tested
- [ ] Backup created
- [ ] Schema changes documented
- [ ] Indexes optimized
- [ ] Data migration scripts tested

### Build
- [ ] Build succeeds locally
- [ ] Build artifacts reviewed
- [ ] Bundle size acceptable
- [ ] No build warnings
- [ ] Static assets optimized

---

## Deployment

### Environment Setup

#### GitHub Secrets Configuration

Before deployment, ensure all required GitHub Secrets are configured in the repository settings:

**Required Secrets:**
- `EXERCISEDB_API_KEY` - Exercise database API key
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `NEXTAUTH_SECRET` - NextAuth.js secret for JWT signing
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis REST token
- `N8N_URL` - n8n instance URL
- `N8N_API_KEY` - n8n API key
- `OCI_ACCESS_KEY_ID` - Oracle Cloud Infrastructure access key
- `OCI_SECRET_ACCESS_KEY` - Oracle Cloud Infrastructure secret key
- `OCI_ENDPOINT` - OCI endpoint URL
- `OCI_BUCKET_NAME` - OCI bucket name for file storage
- `OCI_REGION` - OCI region
- `N8N_SOCIAL_MEDIA_WEBHOOK_URL` - n8n webhook URL for social media
- `OCI_SSH_KEY` - SSH private key for OCI server access
- `OCI_HOST` - OCI server hostname/IP

**Setup Instructions:**
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with the exact name and value
4. Secrets are automatically injected during deployment workflows

#### Production Environment Variables

The deployment workflow automatically creates a `.env` file from GitHub Secrets:

```env
# Automatically generated from GitHub Secrets during deployment
EXERCISEDB_API_KEY=${{ secrets.EXERCISEDB_API_KEY }}
OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}
NEXT_PUBLIC_API_URL=http://${{ secrets.OCI_HOST }}:3000
NEXTAUTH_URL=http://${{ secrets.OCI_HOST }}:3000
NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }}
NEXT_PUBLIC_SUPABASE_URL=${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
SUPABASE_SERVICE_ROLE_KEY=${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
UPSTASH_REDIS_REST_URL=${{ secrets.UPSTASH_REDIS_REST_URL }}
UPSTASH_REDIS_REST_TOKEN=${{ secrets.UPSTASH_REDIS_REST_TOKEN }}
N8N_URL=${{ secrets.N8N_URL }}
N8N_API_KEY=${{ secrets.N8N_API_KEY }}
OCI_ACCESS_KEY_ID=${{ secrets.OCI_ACCESS_KEY_ID }}
OCI_SECRET_ACCESS_KEY=${{ secrets.OCI_SECRET_ACCESS_KEY }}
OCI_ENDPOINT=${{ secrets.OCI_ENDPOINT }}
OCI_BUCKET_NAME=${{ secrets.OCI_BUCKET_NAME }}
OCI_REGION=${{ secrets.OCI_REGION }}
N8N_SOCIAL_MEDIA_WEBHOOK_URL=${{ secrets.N8N_SOCIAL_MEDIA_WEBHOOK_URL }}
```

### Deployment Steps

#### Automated Deployment (GitHub Actions)

The project uses GitHub Actions for automated deployment to OCI:

**Production Deployment:**
- Triggered on push to `main` branch
- Workflow: `.github/workflows/deploy.yml`
- Environment: Production (port 3000)

**Test Deployment:**
- Triggered on push to `test` branch  
- Workflow: `.github/workflows/deploy-test.yml`
- Environment: Test (port 3001)

**Deployment Process:**
1. Code is pushed to respective branch
2. GitHub Actions workflow triggers
3. SSH connection established to OCI server
4. Code is pulled/updated on server
5. `.env` file is created from GitHub Secrets
6. Docker containers are built and deployed
7. Health checks are performed

#### Manual Deployment

#### 1. Build Application
```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Verify build
ls -la .next/
```

#### 2. Database Migration
```bash
# Run migrations
npx supabase db push

# Verify schema
npx supabase db diff
```

#### 3. Deploy to Production

##### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Verify deployment
vercel ls
```

##### Option B: Docker
```bash
# Build Docker image
docker build -t cekuai:latest .

# Tag image
docker tag cekuai:latest your-registry/cekuai:latest

# Push to registry
docker push your-registry/cekuai:latest

# Deploy to server
ssh user@server "docker pull your-registry/cekuai:latest"
ssh user@server "docker-compose up -d"
```

##### Option C: PM2 + Nginx
```bash
# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Verify Deployment
```bash
# Check application status
curl https://your-domain.com/api/health

# Check logs
pm2 logs cekuai
# or
docker logs cekuai
```

---

## Post-Deployment

### Immediate Verification
- [ ] Application accessible at production URL
- [ ] Homepage loads correctly
- [ ] Authentication working (sign in/sign up)
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Static assets loading
- [ ] No console errors

### Functional Testing
- [ ] User can sign up
- [ ] User can sign in
- [ ] User can create workout plan
- [ ] Workout plan displays correctly
- [ ] User can view dashboard
- [ ] User can update settings
- [ ] User can sign out

### Performance Testing
- [ ] Page load time < 3s
- [ ] API response time < 500ms
- [ ] No memory leaks
- [ ] No CPU spikes
- [ ] Database queries optimized

### Monitoring
- [ ] Sentry error tracking active
- [ ] Logs being collected
- [ ] Uptime monitoring configured
- [ ] Performance monitoring active
- [ ] Alerting configured

### Documentation
- [ ] Deployment date recorded
- [ ] Version number documented
- [ ] Known issues documented
- [ ] Rollback plan reviewed

---

## Rollback Procedure

### When to Rollback
- Critical bugs discovered
- Performance degradation
- Security vulnerabilities
- Data corruption
- Service unavailability

### Rollback Steps

#### 1. Stop Current Deployment
```bash
# Vercel
vercel rollback

# Docker
docker-compose down
docker-compose up -d cekuai:previous

# PM2
pm2 stop cekuai
pm2 start ecosystem.config.js --env production -- --previous
```

#### 2. Restore Database (if needed)
```bash
# Restore from backup
npx supabase db restore backup.sql

# Or rollback migrations
npx supabase db reset
```

#### 3. Verify Rollback
```bash
# Check application status
curl https://your-domain.com/api/health

# Check logs
pm2 logs cekuai
# or
docker logs cekuai
```

#### 4. Document Rollback
- [ ] Reason for rollback documented
- [ ] Rollback time recorded
- [ ] Issues fixed documented
- [ ] Re-deployment plan created

---

## Environment Configuration

### Development
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Staging
```env
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
```

### Production
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Docker Configuration

### Dockerfile
```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## PM2 Configuration

### ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'cekuai',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: './',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

---

## Nginx Configuration

### /etc/nginx/sites-available/cekuai
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Health Check Endpoint

### app/api/health/route.ts
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
```

---

## Monitoring & Alerts

### Sentry
- Error tracking configured
- Performance monitoring active
- Release tracking enabled
- Alerts configured for critical errors

### Uptime Monitoring
- UptimeRobot or similar configured
- Checks every 5 minutes
- Alerts on downtime

### Logs
- Application logs in `/var/log/cekuai`
- PM2 logs in `~/.pm2/logs`
- Docker logs with `docker logs cekuai`

---

## Backup Strategy

### Database Backups
```bash
# Daily backup
0 2 * * * pg_dump supabase_db > /backups/db_$(date +\%Y\%m\%d).sql

# Weekly backup retention
find /backups -name "*.sql" -mtime +7 -delete
```

### Application Backups
```bash
# Backup application files
tar -czf /backups/app_$(date +\%Y\%m\%d).tar.gz /app

# Backup configuration
tar -czf /backups/config_$(date +\%Y\%m\%d).tar.gz /app/.env*
```

---

## Security Checklist

### Application Security
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

### Infrastructure Security
- [ ] Firewall configured
- [ ] SSH key authentication
- [ ] Regular security updates
- [ ] Intrusion detection system
- [ ] Backup encryption
- [ ] Access logs monitored

---

## Related Documentation
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Debug guide
- [API_INTEGRATION.md](./API_INTEGRATION.md) - API details
- [CHANGELOG.md](./CHANGELOG.md) - Version history

---

**Last Updated:** January 18, 2025

