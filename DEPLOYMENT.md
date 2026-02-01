# Free Deployment Setup (Vercel)

Get your PM Research app running on a free domain that auto-deploys on every push.

## Quick Setup (5 minutes)

### 1. Sign up for Vercel
Go to [vercel.com](https://vercel.com) and sign up with your GitHub account.

### 2. Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your **PM-Research** repository
3. Vercel auto-detects Next.js - no configuration needed
4. Click **"Deploy"**

### 3. Done!
You'll get a free URL like: `pm-research-yourname.vercel.app`

## Features You Get (Free Tier)

- **Auto-deploy on push**: Every git push triggers a new deployment
- **Preview URLs**: Each branch/PR gets its own preview URL
- **Always running**: No cold starts, instant loading
- **HTTPS included**: Free SSL certificate
- **100GB bandwidth/month**: More than enough for testing
- **Unlimited deployments**: Push as often as you want

## Environment Variables (if needed)

If you have API keys, add them in Vercel:
1. Go to Project Settings → Environment Variables
2. Add variables like `POLYGON_API_KEY`, etc.

## Custom Domain (Optional)

To use a custom domain:
1. Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

## Alternative Free Options

| Platform | Pros | Cons |
|----------|------|------|
| **Vercel** (recommended) | Best Next.js support, always on | - |
| Netlify | Good UI, form handling | Slower Next.js builds |
| Railway | Full backend support | 500 hrs/month free |
| Render | Docker support | Sleeps after 15min idle |

## Local Development

```bash
npm install
npm run dev
# Opens at http://localhost:3000
```
