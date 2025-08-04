# Post-Deployment Configuration

## 1. Update Firebase Authorized Domains

### Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Authentication → Settings → Authorized domains
4. Add your production domains:
   - `your-app.vercel.app`
   - `your-custom-domain.com` (if applicable)

## 2. Update OAuth Redirect URIs

### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials
3. Edit your OAuth 2.0 Client
4. Add Authorized redirect URIs:
   - `https://your-app.vercel.app/__/auth/handler`
   - `https://your-app.vercel.app`

### GitHub OAuth:
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Edit your OAuth App
3. Update Authorization callback URL:
   - `https://your-app.vercel.app/__/auth/handler`

## 3. Test Your Deployment

### Test Authentication:
- [ ] Google Sign-in works
- [ ] GitHub Sign-in works
- [ ] Email/Password Sign-up works

### Test Demo Accounts:
- [ ] Admin login: `admin@techcorp.demo` / `Demo2024!`
- [ ] Member login: `sarah.chen@techcorp.demo` / `Demo2024!`

### Test Core Features:
- [ ] Browse profiles
- [ ] View profile cards
- [ ] Switch between card/list view
- [ ] Profile editing (for authenticated users)

## 4. Share Your Prototype

Share these details with stakeholders:

**Live Demo URL**: `https://your-app.vercel.app`

**Demo Accounts**:
- Admin: `admin@techcorp.demo` / Password: `Demo2024!`
- Member: `sarah.chen@techcorp.demo` / Password: `Demo2024!`

**Key Features to Showcase**:
1. Pre-populated organization with 50 employee profiles
2. Card and List view options
3. Role-based access (Admin vs Member)
4. OAuth authentication (Google & GitHub)
5. Responsive design for mobile/tablet

## 5. Monitor Your App

### Vercel Dashboard:
- View deployment logs
- Monitor performance
- Check function logs
- View analytics

### Firebase Console:
- Monitor authentication usage
- Check Firestore reads/writes
- View Storage usage
- Review security rules

## Troubleshooting Common Issues

### "Firebase App not initialized"
- Ensure all environment variables are set in Vercel
- Rebuild deployment after adding variables

### OAuth Login Fails
- Check authorized domains in Firebase
- Verify redirect URIs in OAuth providers
- Check browser console for specific errors

### Images Not Loading
- Verify image domains in next.config.js
- Check Firebase Storage rules
- Ensure images are publicly accessible