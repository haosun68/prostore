# Vercel Deployment Guide

## 🔧 Required Environment Variables

When deploying this project to Vercel, make sure to set the following environment variables:

### 1. NextAuth Configuration (Required)
```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-vercel-app-url.vercel.app
```

**How to generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. Database (Required)
```
DATABASE_URL=your-database-connection-string
```

### 3. Payment Services (Optional)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=your-paypal-client-id
```

### 4. Email Service (Optional)
```
RESEND_API_KEY=re_...
SENDER_EMAIL=noreply@yourdomain.com
```

### 5. File Upload (Optional)
```
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=your-app-id
```

## 🚀 Setting Environment Variables in Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add the environment variables above
5. Redeploy the project

## ⚠️ Common Issues

### Sign Out Not Working
If the logout functionality is not working, make sure:
- `NEXTAUTH_SECRET` is set
- `NEXTAUTH_URL` is set to the correct production URL
- Redeploy the project to apply environment variables

### Database Connection Issues
- Ensure `DATABASE_URL` format is correct
- Check your database provider's IP whitelist settings