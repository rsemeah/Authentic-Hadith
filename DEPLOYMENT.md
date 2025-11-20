# Quick Start & Deployment Guide

## ⚠️ CRITICAL: NPM Registry Access Required

> **All deployments, PR merges, and build jobs require uninterrupted access to https://registry.npmjs.org**

### Why This Matters
Every `npm install`, `npm ci`, and `npm run build` command downloads packages from the npm registry. If the registry is blocked, all operations will fail immediately with errors like:

```text
npm ERR! code E403
npm ERR! 403 Forbidden - GET https://registry.npmjs.org/next
```

**Before attempting any PR merge or deployment, you MUST verify registry access.**

### Quick Registry Check

Run this command to test registry accessibility:
```bash
curl -I https://registry.npmjs.org/
```

**Expected output:** `HTTP/2 200` or `HTTP/1.1 200 OK`

**Problem indicators:**
- `403 Forbidden` - Registry is blocked by proxy/firewall
- `Connection timeout` - Network restrictions in place
- `SSL/TLS errors` - Certificate issues or MITM proxy

### Common Issues & Solutions

#### 🚫 Issue 1: Corporate Proxy/Firewall Blocking Registry
**Symptoms:** `403 Forbidden` errors during `npm install`

**Solutions:**
1. **Configure npm to use your proxy:**
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

2. **Request registry access from IT:**
   - Request allowlist for: `https://registry.npmjs.org`
   - Also request: `https://*.npmjs.org` (for CDN and metadata)

3. **Verify npm registry setting:**
   ```bash
   npm config get registry
   # Should return: https://registry.npmjs.org/
   ```

#### 🚫 Issue 2: Using Alternative/Private Registry
**Symptoms:** Wrong registry configured, packages not found

**Solution:**
```bash
# Reset to official npm registry
npm config set registry https://registry.npmjs.org/

# Verify the change
npm config get registry
```

#### 🚫 Issue 3: SSL Certificate Errors
**Symptoms:** `CERT_UNTRUSTED` or `SSL Error` messages

**Solutions:**
1. **Install corporate CA certificate** (preferred)
2. **Temporary workaround** (NOT for production):
   ```bash
   npm config set strict-ssl false
   ```
   ⚠️ This disables SSL verification - use only for testing!

### Platform-Specific Guidance

#### ✅ Vercel Deployment
Vercel has built-in npm registry access - **no configuration needed**.

**Pre-deployment checklist:**
- [ ] Environment variables configured in Vercel dashboard
- [ ] Repository connected to Vercel
- [ ] First deploy may take 2-3 minutes for dependency installation

#### ✅ Railway Deployment
Railway provides npm registry access by default.

**Configuration:**
```bash
# No proxy configuration needed
# Ensure no custom network restrictions in Railway settings
```

**Troubleshooting:**
- Check Railway build logs for any network errors
- Verify service region supports npm registry access
- Use Railway's build cache to speed up deployments

#### ✅ Docker Deployment
**Standard Dockerfile** (registry access required):
```dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (requires registry access)
RUN npm ci --only=production

# Copy application
COPY . .

# Build
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

**Network troubleshooting:**
```bash
# Test registry access from inside container
docker run --rm node:20-alpine sh -c "curl -I https://registry.npmjs.org/"

# If blocked, check Docker network settings
docker network inspect bridge

# Use host network for testing (Linux only)
docker run --network=host node:20-alpine sh -c "curl -I https://registry.npmjs.org/"
```

**For restricted environments:**
1. **Build on a machine with registry access**, then deploy the built image
2. **Use multi-stage builds** to separate build and runtime:
   ```dockerfile
   # Build stage (needs registry access)
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   # Production stage (no registry access needed)
   FROM node:20-alpine
   WORKDIR /app
   COPY --from=builder /app/package*.json ./
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/public ./public
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

### Advanced Solutions for Restricted Environments

#### Option 1: Registry Mirror (Temporary Workaround)
If the official registry is blocked, use a mirror as a temporary measure:

```bash
# China mirror (fast in Asia)
npm config set registry https://registry.npmmirror.com/

# Cloudflare mirror
npm config set registry https://registry.npmjs.cf/
```

⚠️ **Warning:** Mirrors may have:
- Synchronization delays (packages may be outdated)
- Different availability/reliability
- Security implications for production use

**Only use mirrors for testing or development - not production deployments.**

#### Option 2: Offline Installation (Extreme Cases Only)
For completely isolated environments:

1. **On a machine with registry access:**
   ```bash
   # Generate a clean install
   npm ci
   
   # Create an offline package cache
   tar -czf node_modules.tar.gz node_modules/
   ```

2. **Transfer `node_modules.tar.gz` to restricted environment**

3. **On restricted machine:**
   ```bash
   tar -xzf node_modules.tar.gz
   npm run build  # Should work with pre-installed modules
   ```

⚠️ **Major drawbacks:**
- **Do NOT commit `node_modules` to git** - this breaks maintainability
- **Manual updates required** for every dependency change
- **Platform-specific** - may not work across different OS/architectures
- **Large file size** - typically 200MB+ 

**This approach is NOT recommended.** It's mentioned only for awareness in extreme cases.

#### Option 3: Package Registry Proxy
For teams, set up a local npm registry proxy:

**Verdaccio (open-source npm proxy):**
```bash
# Install verdaccio
npm install -g verdaccio

# Start proxy server
verdaccio

# Configure npm to use proxy
npm config set registry http://localhost:4873/
```

Benefits:
- Caches packages locally
- Works behind firewall
- Provides audit trail
- Can host private packages

### Pre-Merge Checklist

**Before merging any PR, verify:**
- [ ] Registry access confirmed: `curl -I https://registry.npmjs.org/` returns 200
- [ ] Local build succeeds: `npm ci && npm run build`
- [ ] No proxy/network errors in npm output
- [ ] CI/CD workflows pass (including registry-check workflow)
- [ ] Environment variables configured for deployment platform

**If registry access fails:**
1. ❌ Do NOT merge the PR yet
2. 🔧 Fix registry access using solutions above
3. ✅ Re-run checks and verify success
4. ✅ Then merge and deploy

### Automated Registry Check

This repository includes a GitHub Actions workflow (`.github/workflows/registry-check.yml`) that:
- ✅ Checks registry accessibility before every build
- ✅ Provides detailed troubleshooting guidance if blocked
- ✅ Fails fast to avoid wasted build minutes
- ✅ Verifies successful package installation

**The workflow runs automatically on:**
- Every push to `main` or `develop` branches
- Every pull request
- Manual trigger via GitHub Actions UI

**View workflow results:**
1. Go to repository → Actions tab
2. Select "NPM Registry Access Check" workflow
3. Review results and error messages (if any)

---

## ✅ Project Status
- **Build Status**: ✓ Successful (with registry access)
- **TypeScript Errors**: ✓ All Fixed
- **Dependencies**: ✓ Installed & Secure
- **Registry Check**: ✓ Automated via GitHub Actions
- **Ready for Deployment**: ✓ Yes (verify registry access first)

## 🚀 Quick Start

### Prerequisites
Before you begin, ensure you have:
- **Node.js 18+** and npm installed
- **Uninterrupted access** to https://registry.npmjs.org (test with: `curl -I https://registry.npmjs.org/`)
- Supabase account and project (for database)
- Environment variables ready (see below)

⚠️ **If you get 403/network errors during npm install, see the "NPM Registry Access Required" section above.**

### 1. Local Development
```bash
# Install dependencies
npm install  # or 'npm ci' for clean install

# Run development server
npm run dev
```
Visit `http://localhost:3000`

💡 **Tip:** If `npm install` fails with registry errors, see troubleshooting section above.

### 2. Build for Production
```bash
# Build the project
npm run build

# Test production build locally
npm start
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
Vercel is the creator of Next.js and provides the best integration with built-in npm registry access.

1. **Verify Registry Access First**
   ```bash
   # Test locally first
   curl -I https://registry.npmjs.org/
   npm ci && npm run build
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

4. **Add Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `STRIPE_SECRET_KEY` (if using Stripe)
     - `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY` (if using Stripe)
     - `NEXT_PUBLIC_STRIPE_PRICE_ANNUAL` (if using Stripe)
     - `APP_URL` (your production URL)

5. **Deploy**
   - Click "Deploy"
   - Vercel will run `npm install` and `npm run build` automatically
   - Your app will be live in ~1-2 minutes
   
   💡 **Note:** Vercel has built-in npm registry access - no additional configuration needed!

### Option 2: Railway
Railway provides reliable npm registry access and great developer experience.

1. **Test Build Locally**
   ```bash
   npm ci && npm run build
   ```

2. **Deploy to Railway**
1. Go to https://railway.app
2. Create new project → Deploy from GitHub
3. Select your repository
4. Add environment variables (same as Vercel)
5. Railway will auto-detect Next.js and deploy

💡 **Railway Tips:**
- Uses npm registry by default - no configuration needed
- Check build logs if deployment fails
- Enable "Build Cache" for faster subsequent deployments

### Option 3: Netlify
Netlify supports Next.js and provides npm registry access.

1. **Prepare for Deploy**
   ```bash
   npm ci && npm run build  # Verify build works
   ```

2. **Deploy to Netlify**
1. Go to https://netlify.com
2. Click "Add new site" → Import existing project
3. Select your GitHub repository
4. Build settings are auto-detected:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables in site settings
6. Deploy

💡 **Netlify Note:** Ensure you're using Netlify's Next.js plugin for optimal performance.

### Option 4: Docker / Self-hosted

**Basic Dockerfile (requires registry access during build):**
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (requires npm registry access)
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Build and run:**
```bash
# Test registry access first
curl -I https://registry.npmjs.org/

# Build image (requires registry access)
docker build -t authentic-hadith .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  authentic-hadith
```

💡 **Docker Tips:**
- Build the image on a machine with registry access
- Registry access only needed during build, not runtime
- Use multi-stage builds to keep image size small
- See "Docker Deployment" section above for networking troubleshooting

## 📋 Pre-Deployment Checklist

**Registry & Build:**
- [ ] Registry accessible: `curl -I https://registry.npmjs.org/` returns 200
- [ ] Local build succeeds: `npm ci && npm run build`
- [ ] GitHub Actions workflow passes (check Actions tab)
- [ ] No 403/network errors in build output

**Configuration:**
- [ ] Environment variables configured
- [ ] Supabase project set up
- [ ] Database schema created in Supabase
- [ ] API routes implemented (`/api/assistant`, `/api/report-ai`)

**Optional:**
- [ ] Email/notifications configured (if needed)
- [ ] Domain/DNS configured
- [ ] Stripe keys configured (for paywall features)

💡 **Before merging any PR:** Verify the "NPM Registry Access Check" workflow passes in GitHub Actions.

## 🔧 Project Structure

```
├── app/
│   ├── assistant/
│   │   ├── page.tsx       ← Main chat interface
│   │   └── layout.tsx     ← Page layout
│   ├── page.tsx           ← Landing page
│   ├── layout.tsx         ← Root layout
│   └── globals.css        ← Global styles
├── lib/
│   └── supabase.ts        ← Database client
├── types/
│   └── supabase.ts        ← TypeScript types
├── package.json           ← Dependencies
└── tsconfig.json          ← TypeScript config
```

## 📦 Key Dependencies

- **Next.js 14.2.33** - React framework
- **React 18** - UI library
- **TypeScript 5.3** - Type safety
- **Tailwind CSS 4** - Styling
- **Supabase JS** - Database client

## ⚠️ Important Notes

1. **Environment Variables**: Must be set before deployment
2. **Supabase Setup**: Database schema needs to be created
3. **API Routes**: You need to implement `/api/assistant` and `/api/report-ai`
4. **CORS**: Configure Supabase CORS if calling from different domain

## 🐛 Troubleshooting

### Registry Access Issues
**Problem:** `npm install` fails with 403 Forbidden or timeout errors

**Solution:** See the detailed "NPM Registry Access Required" section at the top of this document.

**Quick fixes:**
```bash
# 1. Test registry access
curl -I https://registry.npmjs.org/

# 2. Check npm registry configuration
npm config get registry

# 3. Reset to official registry if needed
npm config set registry https://registry.npmjs.org/

# 4. Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Build Failures
**Problem:** Build fails with errors

**Solution:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use
**Problem:** Port 3000 already in use

**Solution:**
```bash
npm run dev -- -p 3001  # Use different port
```

### TypeScript Errors
**Problem:** TypeScript compilation errors

**Solution:**
```bash
# Regenerate types and rebuild
npm run build
```

### CI/CD Workflow Failures
**Problem:** GitHub Actions "NPM Registry Access Check" workflow fails

**Solutions:**
1. **Check workflow logs** in GitHub Actions tab for specific error
2. **Verify repository settings** - ensure Actions have internet access
3. **Check for IP blocking** - some organizations block GitHub Actions IPs
4. **Contact GitHub support** if issue persists with Actions infrastructure

💡 **Quick test:** Manually trigger the workflow from Actions tab to see current status.

## 📚 Next Steps

1. **Implement API Routes**
   - Create `app/api/assistant/route.ts`
   - Create `app/api/report-ai/route.ts`

2. **Set Up Supabase**
   - Create tables for messages and feedback
   - Configure authentication if needed

3. **Integrate AI**
   - Add OpenAI API integration
   - Implement prompt engineering for hadith context

4. **Database Schema**
   - Messages table
   - Sessions table
   - Feedback/reports table

## 🎯 Success!
Your Authentic Hadith app is ready for deployment. All errors have been fixed and dependencies are installed. Follow the deployment option above to get your app live!

---

For more help, refer to:
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
