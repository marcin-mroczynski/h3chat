# 🚀 Deployment Guide

## Quick Deployment Steps

### 1. Initialize Git Repository
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: H3 Chat application"

# Create GitHub repository (with GitHub CLI)
gh repo create h3chat --public --push

# Or create manually on GitHub.com and:
git remote add origin https://github.com/YOUR_USERNAME/h3chat.git
git branch -M main
git push -u origin main
```

### 2. Deploy Backend to Railway

**Option A: Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

**Option B: Railway Web Dashboard**
1. Go to https://railway.app/
2. Connect your GitHub account
3. Select "Deploy from GitHub repo"
4. Choose your h3chat repository
5. Railway auto-detects Node.js and deploys
6. Note your app URL: `https://h3chat-production.up.railway.app`

### 3. Configure Frontend for Production

Update `.github/workflows/deploy.yml` with your Railway URL:
```yaml
env:
  VITE_WEBSOCKET_URL: https://YOUR-APP-NAME.up.railway.app  # Replace with your URL
```

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Settings → Pages
3. Source: "GitHub Actions"
4. Save

### 5. Deploy!

```bash
git add .
git commit -m "Configure production deployment"
git push origin main
```

**GitHub Actions will automatically:**
- Build the React frontend
- Deploy to GitHub Pages
- Your app will be live at: `https://YOUR_USERNAME.github.io/h3chat`

## 🔧 Environment Variables

### Railway (Backend)
Set in Railway dashboard or CLI:
```bash
railway variables set NODE_ENV=production
railway variables set PORT=4000  # Railway will override this
```

### GitHub Actions (Frontend)
Already configured in workflow file:
```yaml
env:
  VITE_WEBSOCKET_URL: https://your-backend.railway.app
```

## 🏠 Custom Domain (Optional)

### Backend (Railway)
1. Railway Dashboard → Settings → Domains
2. Add custom domain → Follow DNS instructions

### Frontend (GitHub Pages)
1. Update `deploy.yml`:
```yaml
cname: your-domain.com
```
2. Configure DNS: CNAME record pointing to `YOUR_USERNAME.github.io`

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check Railway logs
railway logs

# Check local production build
npm run build:start
```

### Frontend Issues
```bash
# Check GitHub Actions
# Go to: GitHub → Actions → See build logs

# Test local production build
cd client
npm run build
npx serve dist
```

### WebSocket Connection Issues
- Make sure Railway URL in workflow file is correct
- Check browser developer tools → Network tab
- Verify Railway app is running: visit URL in browser

## 📊 Monitoring

### Railway Dashboard
- View logs, metrics, deployments
- Monitor backend health and usage

### GitHub Pages
- Check Actions tab for deployment status
- View build logs for any errors

## 🔄 Updates

Future updates are automatic:
```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Railway and GitHub Pages will auto-deploy! ✨
```