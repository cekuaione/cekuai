# 📚 Documentation Index

## Overview

This document serves as a quick reference guide to all documentation in the CEKUAI project.

---

## Core Documentation Files

### 1. [CHANGELOG.md](./CHANGELOG.md)
**Purpose:** Version history and change log

**Contains:**
- All changes organized by version
- Added, Changed, Removed, Fixed sections
- Semantic versioning format
- Last updated timestamp

**When to Update:**
- Every significant change
- New features added
- Bugs fixed
- Breaking changes

---

### 2. [SPORT_FEATURE.md](./SPORT_FEATURE.md)
**Purpose:** Complete documentation of the workout plan feature

**Contains:**
- Feature overview and architecture
- User journey diagram
- Component documentation
- State management details
- API integration
- Design system
- Testing checklist
- Future enhancements

**When to Update:**
- New features added to sport section
- Component changes
- API changes
- Design updates

---

### 3. [API_INTEGRATION.md](./API_INTEGRATION.md)
**Purpose:** API integration documentation

**Contains:**
- Supabase integration
- n8n workflow integration
- Internal API routes
- Error handling
- Testing examples
- Rate limiting
- Monitoring setup

**When to Update:**
- New API endpoints added
- API changes
- Integration changes
- Error handling updates

---

### 4. [UI_COMPONENTS.md](./UI_COMPONENTS.md)
**Purpose:** Component library documentation

**Contains:**
- All shared UI components
- All chat-specific components
- Props interfaces
- Usage examples
- Design tokens (colors, typography, spacing)
- Complete code examples

**When to Update:**
- New components created
- Component API changes
- Design token updates
- Usage pattern changes

---

### 5. [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
**Purpose:** Deployment procedures and checklist

**Contains:**
- Pre-deployment checklist
- Deployment steps
- Post-deployment verification
- Rollback procedure
- Environment configuration
- Docker configuration
- PM2 configuration
- Nginx configuration
- Security checklist

**When to Update:**
- Deployment process changes
- New environments added
- Infrastructure changes
- Security updates

---

### 6. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
**Purpose:** Debug guide and common issues

**Contains:**
- Common issues and solutions
- Debug commands
- Log locations
- Database troubleshooting
- API troubleshooting
- Authentication troubleshooting
- Performance troubleshooting
- Getting help resources

**When to Update:**
- New issues discovered
- New solutions found
- Debug commands added
- Log locations changed

---

### 7. [N8N_WORKOUT_API_CONTRACT.md](./N8N_WORKOUT_API_CONTRACT.md)
**Purpose:** n8n workflow specification

**Contains:**
- Workflow contract
- Request/response formats
- Polling implementation
- Error handling
- Testing examples

**When to Update:**
- Workflow changes
- API contract changes
- New endpoints added

---

## Documentation Rules

### ✅ DO:
1. **Update CHANGELOG.md** for every significant change
2. **Update relevant feature doc** when adding features
3. **Update UI_COMPONENTS.md** when creating components
4. **Update TROUBLESHOOTING.md** when fixing bugs
5. **Keep "Last Updated" dates current**
6. **Reference existing docs** instead of duplicating

### ❌ DON'T:
1. Create new MD files without explicit approval
2. Create IMPLEMENTATION.md, CHANGES.md, or similar
3. Duplicate documentation across files
4. Leave outdated information in docs
5. Create temporary documentation files

---

## Update Mapping

| Change Type | Files to Update |
|-------------|-----------------|
| New feature | CHANGELOG.md, SPORT_FEATURE.md |
| New component | CHANGELOG.md, UI_COMPONENTS.md |
| API changes | CHANGELOG.md, API_INTEGRATION.md |
| Bug fix | CHANGELOG.md, TROUBLESHOOTING.md |
| Deployment | CHANGELOG.md, DEPLOYMENT_CHECKLIST.md |
| Any change | CHANGELOG.md |

---

## File Sizes

```
API_INTEGRATION.md        13 KB
CHANGELOG.md              3.9 KB
DEPLOYMENT_CHECKLIST.md   9.5 KB
N8N_WORKOUT_API_CONTRACT.md 11 KB
SPORT_FEATURE.md          13 KB
TROUBLESHOOTING.md        10 KB
UI_COMPONENTS.md          14 KB
```

**Total Documentation:** ~74 KB

---

## Quick Links

### Getting Started
- [README.md](../README.md) - Project overview and quick start
- [CHANGELOG.md](./CHANGELOG.md) - Latest changes

### Development
- [SPORT_FEATURE.md](./SPORT_FEATURE.md) - Feature documentation
- [UI_COMPONENTS.md](./UI_COMPONENTS.md) - Component library
- [API_INTEGRATION.md](./API_INTEGRATION.md) - API details

### Deployment
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Deployment guide

### Troubleshooting
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Debug guide

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [n8n Documentation](https://docs.n8n.io)

---

## Documentation Maintenance

### Regular Reviews
- **Weekly:** Review CHANGELOG.md
- **Monthly:** Review all docs for accuracy
- **Quarterly:** Major documentation audit

### Version Control
- All docs tracked in Git
- Changes reviewed in PRs
- Documentation updates required for code changes

### Feedback
- Report documentation issues in GitHub
- Suggest improvements via PRs
- Keep docs in sync with code

---

## Statistics

- **Total Files:** 7
- **Total Size:** ~74 KB
- **Total Sections:** 50+
- **Code Examples:** 30+
- **Last Updated:** January 18, 2025

---

**Remember:** Good documentation is as important as good code. Keep it updated!

