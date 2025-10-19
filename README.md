# 💪 CEKUAI - AI Personal Trainer

A Next.js application for generating personalized workout plans using AI-powered conversational interface.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- Supabase account
- n8n instance (optional, for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/cekuai.git
cd cekuai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📚 Documentation

### Core Documentation Files

All project documentation is maintained in the `/docs` directory. **Important:** Always update existing files instead of creating new ones.

| Document | Description |
|----------|-------------|
| [CHANGELOG.md](/docs/CHANGELOG.md) | Version history and all changes |
| [SPORT_FEATURE.md](/docs/SPORT_FEATURE.md) | Workout plan feature documentation |
| [API_INTEGRATION.md](/docs/API_INTEGRATION.md) | Supabase, n8n, and API details |
| [UI_COMPONENTS.md](/docs/UI_COMPONENTS.md) | Component library and design tokens |
| [DEPLOYMENT_CHECKLIST.md](/docs/DEPLOYMENT_CHECKLIST.md) | Deployment procedures and checklist |
| [TROUBLESHOOTING.md](/docs/TROUBLESHOOTING.md) | Debug guide and common issues |

### Documentation Rules

**✅ DO:**
- Update CHANGELOG.md for every change
- Update relevant feature docs when adding features
- Update UI_COMPONENTS.md when creating components
- Keep "Last Updated" dates current

**❌ DON'T:**
- Create new MD files without approval
- Create IMPLEMENTATION.md, CHANGES.md, etc.
- Duplicate documentation across files
- Leave outdated information in docs

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Animations:** Framer Motion
- **Forms:** React Hook Form
- **Validation:** Zod

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** NextAuth.js + Supabase Adapter
- **API Routes:** Next.js API Routes
- **Workflow Automation:** n8n
- **Rate Limiting:** Upstash Redis
- **Error Tracking:** Sentry

### Infrastructure
- **Deployment:** Vercel / Docker / PM2
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry, Vercel Analytics

---

## 📁 Project Structure

```
cekuai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── workout/      # Workout plan endpoints
│   ├── auth/             # Authentication pages
│   │   ├── signin/       # Sign in page
│   │   ├── signup/       # Sign up page
│   │   └── verify-email/ # Email verification
│   ├── dashboard/        # Dashboard pages
│   │   ├── plans/        # Workout plans list & detail
│   │   └── settings/     # User settings
│   ├── sport/            # Sport feature pages
│   │   └── workout-plan/ # Chat-based workout generator
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/              # UI library components
│   ├── dashboard/       # Dashboard components
│   ├── sport/           # Sport feature components
│   └── layout/          # Layout components
├── lib/                 # Utility functions
│   ├── supabase/        # Supabase client
│   ├── auth.ts          # Authentication helpers
│   ├── n8n.ts           # n8n integration
│   └── rate-limit.ts    # Rate limiting
├── docs/                # Documentation
├── public/              # Static assets
├── .cursorrules         # Cursor AI rules
├── .env.local           # Environment variables (not in git)
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Next.js
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# n8n (optional)
N8N_URL=https://your-n8n-instance.com
N8N_API_KEY=your_n8n_api_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_token
```

---

## 🎯 Features

### Authentication
- Email/password signup
- Email verification
- Sign in/Sign out
- Protected routes
- Session management

### Workout Plan Generation
- AI-powered conversational interface
- WhatsApp-style chat UI
- 11-step guided conversation flow
- Goal, level, schedule customization
- Equipment selection
- Custom notes
- Summary confirmation with edit capability
- Real-time plan generation

### Dashboard
- View all workout plans
- Plan details and exercises
- Edit profile settings
- Delete plans

### UI/UX
- Dark theme with blue/purple gradients
- Mobile-first responsive design
- Smooth animations
- Accessibility compliant (WCAG AA)
- Turkish language support

---

## 🧪 Testing

### Manual Testing
```bash
# Run development server
npm run dev

# Test in browser
# http://localhost:3000
```

### Build Test
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Type Checking
```bash
# Check TypeScript errors
npx tsc --noEmit
```

### Linting
```bash
# Run ESLint
npm run lint
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```bash
# Build image
docker build -t cekuai:latest .

# Run container
docker run -p 3000:3000 cekuai:latest
```

### PM2 + Nginx
```bash
# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Configure Nginx
# See DEPLOYMENT_CHECKLIST.md for details
```

For detailed deployment instructions, see [DEPLOYMENT_CHECKLIST.md](/docs/DEPLOYMENT_CHECKLIST.md).

---

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Database connection failed:**
```bash
# Check Supabase credentials
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

For more troubleshooting tips, see [TROUBLESHOOTING.md](/docs/TROUBLESHOOTING.md).

---

## 📊 Performance

### Optimization Techniques
- Code splitting with Next.js
- Image optimization with `next/image`
- CSS animations over JavaScript
- Memoization with `useCallback` and `useMemo`
- Lazy loading of components
- Static generation where possible

### Performance Targets
- First Contentful Paint: < 1.8s
- Time to Interactive: < 3.8s
- Cumulative Layout Shift: < 0.1
- Largest Contentful Paint: < 2.5s

---

## 🔒 Security

### Security Features
- Environment variables for secrets
- HTTPS in production
- Secure cookie flags
- Rate limiting
- Input validation
- SQL injection prevention
- XSS prevention
- CSRF protection

### Security Checklist
- [ ] All API keys in environment variables
- [ ] No secrets in code
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Dependencies updated

---

## ♿ Accessibility

### WCAG Compliance
- ✅ All images have alt text
- ✅ All buttons have labels
- ✅ Color contrast meets AA standards
- ✅ Keyboard navigation works
- ✅ Screen reader friendly
- ✅ Focus indicators visible
- ✅ Touch targets minimum 44x44px

---

## 🤝 Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/description`
2. Make changes
3. Update documentation
4. Test changes
5. Commit: `git commit -m "feat: add feature"`
6. Push: `git push origin feature/description`
7. Create pull request

### Commit Message Format
```
type: description

Types: feat, fix, docs, style, refactor, test, chore
```

---

## 📝 License

This project is proprietary and confidential.

---

## 👥 Team

- **Developer:** Your Name
- **Designer:** Your Designer
- **Product Manager:** Your PM

---

## 📞 Support

- **Documentation:** See `/docs` directory
- **Issues:** GitHub Issues
- **Email:** support@your-domain.com

---

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [n8n Documentation](https://docs.n8n.io)
- [Vercel Documentation](https://vercel.com/docs)

---

**Built with ❤️ for fitness enthusiasts**
