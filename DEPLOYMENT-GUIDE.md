# 🚀 คู่มือการ Deploy ไป Plesk Obsidian

## 📋 ข้อมูลทั่วไป

**โปรเจกต์:** 170sa Analytics Dashboard  
**Framework:** Next.js 15.5.3  
**Database:** MySQL (BigQuery integration)  
**Environment:** Node.js 18+  

## 🔧 ข้อกำหนดเซิร์ฟเวอร์

### สำหรับ Plesk Obsidian:
- **Node.js:** 18.x หรือสูงกว่า
- **NPM:** 8.x หรือสูงกว่า
- **MySQL:** 5.7+ หรือ 8.0+
- **Memory:** อย่างน้อย 2GB RAM
- **Storage:** อย่างน้อย 5GB

## 📁 การเตรียม Files สำหรับ Deploy

### 1. ไฟล์ที่จำเป็น:
```
bigquery/
├── .env.production          # Environment variables สำหรับ production
├── package.json             # Dependencies และ scripts
├── server.js               # Production server
├── ecosystem.config.js     # PM2 configuration
├── next.config.ts          # Next.js configuration
├── middleware.ts           # Authentication middleware
├── prisma/
│   └── schema.prisma       # Database schema
├── app/                    # Next.js App Router
├── components/             # React components
├── lib/                    # Utilities และ services
└── public/                 # Static assets
```

### 2. ไฟล์ที่ไม่ต้อง upload:
- `node_modules/`
- `.next/`
- `test-*.html`
- `debug-*.js`
- `check-users.js`
- `.env` (development)
- `logs/`

## 🔐 การตั้งค่า Environment Variables

### ใน Plesk Control Panel:
1. เข้าไปยัง **Node.js Settings**
2. เพิ่ม Environment Variables ดังนี้:

```bash
NODE_ENV=production
DATABASE_URL=mysql://sacom_new:sRR10s47dfersl@103.80.48.25:3306/bigquery
ADSER_DATABASE_URL=mysql://sacom_new:sRR10s47dfersl@103.80.48.25:3306/170sa
JWT_SECRET=b1g+H7iP5tYq/N8dK3sA2vL9wXzF6jR0cE4mG1uV7o=P@ssw0rd2024!
NEXTAUTH_URL=https://170sa.com
NEXTAUTH_SECRET=b1g+H7iP5tYq/N8dK3sA2vL9wXzF6jR0cE4mG1uV7o=

# BigQuery Configuration
GOOGLE_PROJECT_ID=sa-ads
GOOGLE_CLIENT_EMAIL=thailand-sh0424@sa-ads.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC+qHV5fCkSflmE\nTjRMo0kjyo+fhQjS3FZ9JGLZRTeXgoGZKtTrlSZWfFmrqYhDlqX6w8tfYGBWmwce\n3MW3WRp1hKiOHAOHC2lAeNd3WB2bkfmtwU6+A2Yhf7mFMkmxmL+NZQ/H36m+rB3S\nk9jOaX7jVuKh1VPvLZkGYgZiSaU7ZpG1LxCisUGECEk4tew3ajl5h1pjO6Rx6VOo\nCZj4kgh59ZSpLyzs00uLUHvTfLDK81QuTMRjoncsLpjOSKUPBT8/cNSKn7VAmiXG\nis34y4kJZq2REDzfXsCzLhc6ZJDqgRIgxVHtlIfho1kfyFOQnlYyV6iBLmE3gag4\ncIxp3uwNAgMBAAECggEABOwcfFJ0TQHuFbhfKUtd7Aqiwp+QpsEBiqGR28IpuUOp\nTOcKMDrdjoYPWps55WTSTDMZ4RB/7Dx8ZpOUlzM5t6cBIwoeHTJyOTPlfDNOMGII\nbC/9dHJqBJtjksjFlkw3RdNCIQrpOv7+lh0zD8ExgXUQzNTRIe+vb7bAK3FzTqE/\n4KsOCsMrZGsvrhnoykjvoio7OfHGHUfq1y4k+IttYKFYfVMhnu9PHY3xiCZ8DK+c\nOuhqMena2UivYqX2YtxWonZ7b0oZIJcQEwTU1xZIafn7RzGmLx2aOFQtiLZsvb/h\nVubBbcWl4VpL/jdWEF7g2fZjsFto12THu2W/XiFnAQKBgQDh/Ld98/FpzO8ejS3V\nswgf/x/WVslvXSw5Nn5kzICw0TFJ/o2bX0KMIstqhmVHUt+qV6bfakb6FTfYGkDX\n10MGU3+gI4Wmh7bKOV393M3b8NnfnTEOZLbDdwZkuD4mC9ki3cuY+ILp+MKQSIF2\nsedXtDPLa6RRTxfZynxBcre5XQKBgQDX+phy7+2DDKWO8Ei1p9QxN4zT6JaCsJK4\niZpPmsJgH5RPtZUE1XGSfiWVhfpVBIjvDjqbZHhsRj11wlnz030A0b/ldWUKFD6k\nd0AzX+f25CPqOB6E6DrZ11QzSA6YO8NOdmc2wl8imZHnoOkDpa7xDRUWxJQrUq7u\nenCLvYricQKBgHSVvcwa14avlQT77JN8w0pOggw/xbfQJ4p0lIxH/HQ71+PGkSOA\n54IISUzxfLppBL6KbaqA15EY9TBliuJPSWKwHP1ulfqttR1qrxTSntlCzgPQwogc\naTU56HB5pIZYQnL8XZbTTiaKkUWCQlgLu7/BVZ8yLxlLZpCTJ7tUBXh5AoGBALj4\nphfJ5GCYNDJ3F858Lf741GOojz7eesoRD1ed81rfsOWTXk0FgH82CnpEhGDLwXr7\ndLYhFgGlJn30NZXdSvGosfCS2jYHoJ66gwF84e1Q9nFiHsE1IzHueO5yiA1ZIavR\nPBRp45B+dbcq2GWHQIyx553YPg3cgnU756fGbWwBAoGBAIs5lItiU+OlYAD5+Zuh\nC8pumYoySuG47sDVI/MUxfGe3nzOi7yKM+JI2+GROmdFD9Hnm18MeaQUUXfywamj\ncI96DtI1v1S3QT/Nboo+AB4W7rAhJxc5BxFTRytum18xu61Tz4rJn64Rn5v44Cup\n/ACg/1uKtZ4p4qSyYdEhQeLW\n-----END PRIVATE KEY-----\n"

# API Keys
EXCHANGE_RATE_API_KEY=531f86c756c6b290472d9f45
EXCHANGE_API_URL=https://v6.exchangerate-api.com/v6/531f86c756c6b290472d9f45/latest/USD
GOOGLE_API_KEY=AIzaSyAMwdqaWNpnFpeLOoq8kufa_gsDfqAqF8s
GOOGLE_SHEET_ID=15yR37dqHgRKHL3hfgO-QKvbyOWlgJaWo3dzQjJGJBLM
SYNC_API_KEY=newgate-sync-now
```

## 📦 ขั้นตอนการ Deploy

### Step 1: Upload Files
1. **Zip โปรเจกต์** (ยกเว้น node_modules, .next)
2. **Upload ผ่าน Plesk File Manager** หรือ FTP
3. **แตกไฟล์** ใน document root

### Step 2: Setup Node.js Application
1. ใน Plesk Panel เข้าไปยัง **Node.js**
2. **สร้าง Application ใหม่**:
   - **Node.js Version:** 18.x
   - **Application Mode:** Production
   - **Document Root:** `/httpdocs` (หรือโฟลเดอร์ที่ upload)
   - **Startup File:** `server.js`

### Step 3: Install Dependencies
ใน Plesk Terminal หรือ SSH:
```bash
cd /var/www/vhosts/170sa.com/httpdocs
npm install --production
```

### Step 4: Generate Prisma Client
```bash
npx prisma generate
```

### Step 5: Build Application
```bash
npm run build
```

### Step 6: Start Application
```bash
npm run start:prod
```

หรือใช้ PM2:
```bash
npm install -g pm2
npm run pm2:start
```

## 🔧 การตั้งค่า Plesk เพิ่มเติม

### 1. Apache/Nginx Configuration
สร้างไฟล์ `.htaccess` (Apache) หรือ nginx config:

**สำหรับ Apache (.htaccess):**
```apache
RewriteEngine On
RewriteRule ^(?!api/).*$ http://localhost:3000%{REQUEST_URI} [P,L]
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
```

**สำหรับ Nginx:**
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}
```

### 2. SSL Certificate
1. ใน Plesk Panel ไปยัง **SSL/TLS Certificates**
2. **ติดตั้ง Let's Encrypt** certificate
3. **Force HTTPS redirect**

### 3. Firewall Rules
- **เปิด Port 3000** สำหรับ Node.js application
- **อนุญาต MySQL connections** (Port 3306)

## 📊 การ Monitor และ Debug

### 1. ดู Logs
```bash
# PM2 logs
pm2 logs 170sa-analytics

# Application logs
tail -f logs/combined.log
```

### 2. Check Status
```bash
# PM2 status
pm2 status

# Process status
ps aux | grep node
```

### 3. Memory และ CPU Usage
```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

## 🚨 Troubleshooting

### ปัญหาที่อาจพบ:

1. **Port Already in Use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Database Connection Issues**
   - ตรวจสอบ DATABASE_URL
   - ตรวจสอบ MySQL service status

3. **Prisma Client Issues**
   ```bash
   npx prisma generate --force
   ```

4. **Memory Issues**
   - เพิ่ม swap space
   - ลด PM2 instances

5. **SSL/HTTPS Issues**
   - ตรวจสอบ certificate
   - ตรวจสอบ NEXTAUTH_URL

## 📝 Post-Deployment Checklist

- [ ] ✅ Application เริ่มต้นได้
- [ ] ✅ Database connection ทำงาน
- [ ] ✅ Login system ทำงาน
- [ ] ✅ Session management ทำงาน
- [ ] ✅ Real-time notifications ทำงาน
- [ ] ✅ BigQuery integration ทำงาน
- [ ] ✅ SSL certificate ติดตั้งแล้ว
- [ ] ✅ Logs ทำงานปกติ
- [ ] ✅ PM2 monitoring setup

## 🔄 การ Update Production

### การ Update Code:
```bash
# Stop application
pm2 stop 170sa-analytics

# Pull new code
git pull origin master

# Install new dependencies
npm install --production

# Rebuild
npm run build

# Restart
pm2 restart 170sa-analytics
```

### Zero-downtime Deployment:
```bash
npm run deploy:prepare
pm2 reload 170sa-analytics
```

## 📞 Support Information

**Technical Contact:** newgate  
**Database Server:** 103.80.48.25:3306  
**Application URL:** https://170sa.com  
**GitHub Repository:** [newgate0424/bigquery](https://github.com/newgate0424/bigquery)

---

## 🎯 ข้อมูลสำคัญสำหรับการ Deploy

### Core Features:
- ✅ **Single Session Management** - ผู้ใช้ล็อกอินได้เครื่องเดียว
- ✅ **Real-time Notifications** - แจ้งเตือนเมื่อมีการล็อกอินใหม่
- ✅ **BigQuery Integration** - ดึงข้อมูลจาก Google BigQuery
- ✅ **MySQL Database** - จัดเก็บข้อมูลผู้ใช้และ sessions
- ✅ **JWT Authentication** - ระบบ authentication ที่ปลอดภัย

### Performance Optimizations:
- Next.js standalone output
- Gzip compression
- Security headers
- Prisma connection pooling
- PM2 process management

ระบบพร้อม deploy ไป production แล้วครับ! 🚀