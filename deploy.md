# 🚀 170sa Analytics - Deployment Guide

## 📋 การเตรียมพร้อมสำหรับ Deployment

### 1. Build Production
```bash
npm run build
```

### 2. ตัวเลือกการรัน Production

#### A. รันด้วย app.js (แนะนำ)
```bash
npm run start:prod
```

#### B. รันด้วย start.js wrapper
```bash
npm run start:server
```

#### C. รันด้วย Next.js default
```bash
npm start
```

## 🔧 การ Deploy ด้วย PM2 (แนะนำสำหรับ Production)

### 1. ติดตั้ง PM2
```bash
npm install -g pm2
```

### 2. เริ่มแอปพลิเคชัน
```bash
npm run pm2:start
```

### 3. คำสั่ง PM2 อื่นๆ
```bash
# ดูสถานะ
pm2 status

# รีสตาร์ท
npm run pm2:restart

# หยุด
npm run pm2:stop

# ลบ
npm run pm2:delete

# ดู logs
pm2 logs 170sa-analytics

# Monitor
pm2 monit
```

## 🐳 การ Deploy ด้วย Docker

### 1. Build Docker Image
```bash
docker build -t 170sa-analytics .
```

### 2. รัน Container
```bash
docker run -p 3000:3000 -e NODE_ENV=production 170sa-analytics
```

### 3. Docker Compose (ถ้ามี database)
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=your-database-url
```

## ☁️ การ Deploy บน Cloud Platforms

### 1. Vercel (แนะนำ)
```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 2. Railway
```bash
# เชื่อมต่อ GitHub repo กับ Railway
# Railway จะ deploy อัตโนมัติ
```

### 3. DigitalOcean/AWS/GCP
- อัปโหลดโค้ดไปเซิร์ฟเวอร์
- รัน `npm install`
- รัน `npm run build`
- รัน `npm run pm2:start`

## 🔐 Environment Variables สำหรับ Production

สร้างไฟล์ `.env.production.local`:
```
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-strong-jwt-secret
BIGQUERY_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
PORT=3000
HOSTNAME=0.0.0.0
```

## 📊 การ Monitor และ Logging

### 1. PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
```

### 2. Health Check
```bash
# ตรวจสอบว่าเซิร์ฟเวอร์ทำงาน
curl http://localhost:3000

# ตรวจสอบ API
curl http://localhost:3000/api/auth/me
```

## 🛡️ Security Checklist

- [ ] อัปเดต JWT_SECRET ให้แข็งแกร่ง
- [ ] ตั้งค่า CORS ให้ถูกต้อง
- [ ] ใช้ HTTPS ใน production
- [ ] ซ่อน /newgate endpoint (ไม่เผยแพร่ลิงค์)
- [ ] Backup database เป็นประจำ
- [ ] Monitor logs สำหรับความผิดปกติ

## 🚨 Troubleshooting

### Error: Module not found
```bash
npm install
npm run build
```

### Port already in use
```bash
# หา process ที่ใช้ port
netstat -ano | findstr :3000
# หรือเปลี่ยน PORT ใน .env
```

### Database connection error
- ตรวจสอบ DATABASE_URL
- ตรวจสอบ credentials.json
- ตรวจสอบ network connectivity

---
🎉 **170sa Analytics พร้อม Deploy แล้ว!**