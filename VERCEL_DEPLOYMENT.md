# Vercel 部署指南

## 🔧 必需的环境变量

在Vercel中部署此项目时，请确保设置以下环境变量：

### 1. NextAuth 配置 (必需)
```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-vercel-app-url.vercel.app
```

**如何生成 NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. 数据库 (必需)
```
DATABASE_URL=your-database-connection-string
```

### 3. 支付服务 (可选)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=your-paypal-client-id
```

### 4. 邮件服务 (可选)
```
RESEND_API_KEY=re_...
SENDER_EMAIL=noreply@yourdomain.com
```

### 5. 文件上传 (可选)
```
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=your-app-id
```

## 🚀 在Vercel中设置环境变量

1. 登录到 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 转到 **Settings** > **Environment Variables**
4. 添加上述环境变量
5. 重新部署项目

## ⚠️ 常见问题

### Sign Out 不工作
如果登出功能不工作，请确保：
- `NEXTAUTH_SECRET` 已设置
- `NEXTAUTH_URL` 设置为正确的生产URL
- 重新部署项目以应用环境变量

### 数据库连接问题
- 确保 `DATABASE_URL` 格式正确
- 检查数据库提供商的IP白名单设置
