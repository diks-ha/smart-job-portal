# Smart Job Portal - Deployment Guide

This guide covers deploying both the backend (Express.js + MongoDB) and frontend (Next.js 14) of your Smart Job Portal application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Production Platforms](#production-platforms)
6. [Quick Start Guide](#quick-start-guide)

---

## Prerequisites

Before deploying, ensure you have:

- **Node.js** (v18+) installed
- **MongoDB** database (local or cloud)
- **OpenAI API key** (for AI resume matching)
- **Git** for version control

---

## Environment Variables

### Backend (.env)

Create a `.env` file in the `backend/` directory:

```
env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jobportal

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# OpenAI (for AI resume matching)
OPENAI_API_KEY=sk-your-openai-api-key

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env.local)

Create a `.env.local` file in the `frontend/` directory:

```
env
# API URL (point to your deployed backend)
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

---

## Backend Deployment

### Option 1: Deploy to Render.com (Recommended Free Tier)

1. **Push your code to GitHub**

2. **Create a Render account** and connect your GitHub

3. **Create a Web Service:**
   - Name: `smart-job-portal-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables** in Render dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `NODE_ENV=production`

5. **Deploy** - Render will automatically build and deploy

### Option 2: Deploy to Railway

1. **Install Railway CLI:** `npm install -g @railway/cli`
2. **Login:** `railway login`
3. **Create project:** `railway init`
4. **Add MongoDB:** `railway add plugin mongo`
5. **Deploy:** `railway up`

### Option 3: Deploy to Heroku

1. **Create Heroku app:** `heroku create smart-job-portal-backend`
2. **Set environment variables:**
   
```
bash
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-secret
   heroku config:set OPENAI_API_KEY=your-key
   heroku config:set NODE_ENV=production
   
```
3. **Deploy:** `git push heroku main`

### Option 4: Deploy to VPS (DigitalOcean, AWS, etc.)

1. **Upload your code** to the server
2. **Install dependencies:** `npm install --production`
3. **Use PM2 for process management:**
   
```
bash
   npm install -g pm2
   pm2 start src/index.js --name job-portal-backend
   pm2 startup
   pm2 save
   
```
4. **Set up Nginx as reverse proxy**

---

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended for Next.js)

1. **Install Vercel CLI:** `npm i -g vercel`
2. **Deploy:**
   
```
bash
   cd frontend
   vercel
   
```
3. **Or connect GitHub:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variable: `NEXT_PUBLIC_API_URL`

### Option 2: Deploy to Netlify

1. **Build the app:**
   
```
bash
   cd frontend
   npm run build
   
```

2. **Deploy the `out` or `.next` folder**

3. **Or connect GitHub** and configure:
   - Build command: `npm run build`
   - Output directory: `.next`
   - Add environment variable: `NEXT_PUBLIC_API_URL`

### Option 3: Deploy to Cloudflare Pages

1. **Connect your GitHub repository**
2. **Configure:**
   - Build command: `npm run build`
   - Build output directory: `.next`
3. **Add environment variable:** `NEXT_PUBLIC_API_URL`

---

## Production Platforms Comparison

| Platform | Backend | Frontend | Free Tier | Notes |
|----------|---------|----------|-----------|-------|
| **Render** | ✅ | ❌ | ✅ | Great for backend, use Vercel for frontend |
| **Vercel** | ❌ | ✅ | ✅ | Best for Next.js frontend |
| **Railway** | ✅ | ✅ | ✅ | Good for full-stack |
| **Heroku** | ✅ | ✅ | ❌ | No longer has free tier |
| **Netlify** | ❌ | ✅ | ✅ | Great for frontend |
| **DigitalOcean** | ✅ | ✅ | ❌ | VPS, more control |

---

## Quick Start Guide

### Deploy Backend to Render

```
bash
# 1. Prepare for production
cd backend
npm install

# 2. Test locally
npm start

# 3. Deploy to Render (via GitHub)
# See Option 1 above
```

### Deploy Frontend to Vercel

```
bash
# 1. Navigate to frontend
cd frontend

# 2. Create environment file
echo "NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api" > .env.local

# 3. Deploy via Vercel CLI
npx vercel --prod

# Or deploy via GitHub integration
```

---

## Post-Deployment Checklist

- [ ] Update CORS in backend to allow your frontend domain
- [ ] Update `NEXT_PUBLIC_API_URL` in frontend
- [ ] Test authentication (login/register)
- [ ] Test file uploads (resume upload)
- [ ] Test AI resume matching functionality
- [ ] Set up SSL/HTTPS (usually automatic on platforms)
- [ ] Configure custom domain (optional)

---

## Troubleshooting

### Common Issues

1. **CORS errors:**
   - Update `FRONTEND_URL` in backend `.env`

2. **MongoDB connection errors:**
   - Verify `MONGODB_URI` is correct
   - Check IP whitelist in MongoDB Atlas

3. **API not responding:**
   - Check if backend is running
   - Verify environment variables are set

4. **Build errors:**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

---

## Security Recommendations

1. **Never commit** `.env` files to GitHub
2. **Use strong JWT secrets** (use a random string generator)
3. **Enable HTTPS** (automatic on most platforms)
4. **Rate limiting** (consider adding express-rate-limit)
5. **Input validation** (already implemented with validator)

---

## Architecture Overview

```
                    ┌─────────────────┐
                    │   Frontend      │
                    │   (Next.js)     │
                    │   Port 3000     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Backend       │
                    │   (Express)     │
                    │   Port 5000     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   MongoDB       │
                    │   (Database)    │
                    └─────────────────┘

Additional Services:
- OpenAI API (AI resume matching)
- File uploads (stored locally or cloud)
```

---

## Need Help?

If you encounter issues during deployment, check:
1. Platform-specific documentation
2. Console logs for error messages
3. Environment variable configuration

For additional support, refer to:
- [Express.js Deployment](https://expressjs.com/en/advanced/pm.html)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
