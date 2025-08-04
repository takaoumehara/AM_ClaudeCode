# Deployment Guide for AboutMe Cards

## Prerequisites
- Git repository (GitHub, GitLab, or Bitbucket)
- Firebase project configured
- Environment variables from `.env.local`

## Option 1: Deploy to Vercel (Recommended)

### Steps:
1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/aboutme-cards.git
   git push -u origin main
   ```

2. **Sign up/Login to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

3. **Import your project**:
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

4. **Configure Environment Variables**:
   - Add all variables from `.env.local`:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
     NEXT_PUBLIC_FIREBASE_PROJECT_ID
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
     NEXT_PUBLIC_FIREBASE_APP_ID
     ```

5. **Deploy**:
   - Click "Deploy"
   - Your app will be live at `https://your-project.vercel.app`

### Vercel CLI Alternative:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

## Option 2: Deploy to Netlify

### Steps:
1. **Create netlify.toml** in project root:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **Deploy via Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your project folder OR connect GitHub
   - Add environment variables in Site Settings

## Option 3: Deploy to Railway

### Steps:
1. **Sign up at [railway.app](https://railway.app)**

2. **Deploy from GitHub**:
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository

3. **Add environment variables** in the Railway dashboard

4. **Deploy** - Railway will auto-detect Next.js

## Option 4: Deploy to Render

### Steps:
1. **Create render.yaml** in project root:
   ```yaml
   services:
     - type: web
       name: aboutme-cards
       env: node
       buildCommand: npm install && npm run build
       startCommand: npm run start
       envVars:
         - key: NODE_ENV
           value: production
   ```

2. **Deploy on [render.com](https://render.com)**

## Firebase Hosting (Static Export)

If you want to use Firebase Hosting:

1. **Update next.config.js**:
   ```javascript
   module.exports = {
     output: 'export',
     // ... rest of config
   }
   ```

2. **Build and deploy**:
   ```bash
   npm run build
   firebase init hosting
   firebase deploy
   ```

## Important Deployment Checklist

- [ ] All environment variables are set
- [ ] Firebase security rules are configured
- [ ] GitHub OAuth redirect URIs updated (add production URL)
- [ ] Google OAuth redirect URIs updated (add production URL)
- [ ] Test authentication flows on production
- [ ] Update Firebase authorized domains

## Sharing Your Prototype

Once deployed, you can share:
- **Production URL**: `https://your-app.vercel.app`
- **Demo Accounts**:
  - Admin: `admin@techcorp.demo` / `Demo2024!`
  - Member: `sarah.chen@techcorp.demo` / `Demo2024!`

## Troubleshooting

### Build Errors
```bash
# Test build locally
npm run build
npm run start
```

### Environment Variables Not Working
- Ensure all vars start with `NEXT_PUBLIC_` for client-side access
- Rebuild after adding new environment variables

### Authentication Not Working
- Add production domain to Firebase Console:
  - Authentication → Settings → Authorized domains
  - OAuth providers → Update redirect URIs