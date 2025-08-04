# Development Workflow with Vercel

## Making Updates After Deployment

### Quick Updates (Direct to Production)
```bash
# 1. Make your changes
# Edit files as needed

# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Update profile cards design"
git push origin main

# 4. Vercel auto-deploys (usually within 1-2 minutes)
```

### Safe Updates (Using Preview)
```bash
# 1. Create a feature branch
git checkout -b feature/update-profile-cards

# 2. Make changes and test
npm run dev

# 3. Push to get preview URL
git add .
git commit -m "Update profile cards"
git push origin feature/update-profile-cards

# 4. Vercel creates preview deployment
# Check the preview URL in Vercel dashboard or GitHub

# 5. If happy, merge to main
git checkout main
git merge feature/update-profile-cards
git push origin main
```

## Monitoring Deployments

### Vercel Dashboard
- See all deployments: https://vercel.com/dashboard
- View build logs
- Check deployment status
- Access preview URLs

### GitHub Integration
- See deployment status on commits
- Preview links in pull requests
- Deployment checks before merging

## Environment Variables

### Adding New Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the new variable
3. Trigger a redeployment (or push any commit)

### Updating Variables
- Changes to env vars require a redeployment
- Can trigger manually from Vercel dashboard
- Or push any commit to trigger rebuild

## Rollback if Needed

### From Vercel Dashboard
1. Go to your project
2. Click "Deployments" tab
3. Find a previous working deployment
4. Click "..." → "Promote to Production"

### Using Git
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

## Best Practices

1. **Always test locally first**
   ```bash
   npm run build
   npm run start
   ```

2. **Use preview deployments for significant changes**

3. **Monitor the Vercel dashboard after pushing**

4. **Set up notifications**
   - Vercel can notify you via email/Slack about deployment status

## Common Issues

### Build Fails
- Check build logs in Vercel dashboard
- Common causes:
  - Missing environment variables
  - TypeScript errors
  - Missing dependencies

### Updates Not Showing
- Hard refresh browser (Cmd+Shift+R)
- Check if deployment completed
- Verify you pushed to correct branch

### Performance Issues
- Check Vercel Analytics
- Review build output size
- Optimize images and code splitting