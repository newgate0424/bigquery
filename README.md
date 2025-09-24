# 🚀 170sa Analytics Dashboard

Modern analytics dashboard for advertising data visualization and management, built with Next.js 15 and TypeScript.

## ✨ Features

- **Real-time Analytics** - Live data monitoring and visualization
- **Advanced Filtering** - Powerful data filtering and search capabilities
- **User Management** - Role-based access control with JWT authentication
- **Responsive Design** - Mobile-friendly interface with dark/light mode
- **BigQuery Integration** - Direct connection to Google BigQuery
- **Data Export** - Export data in various formats
- **Custom Dashboards** - Personalized dashboard views

## 🛠️ Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Backend:** Next.js API Routes
- **Database:** MySQL with Prisma ORM
- **Authentication:** JWT with bcryptjs
- **Data Source:** Google BigQuery
- **Deployment:** Docker, PM2, Node.js

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MySQL Database
- Google Cloud BigQuery access
- Git

### 1. Clone Repository
```bash
git clone https://github.com/newgate0424/bigquery.git
cd bigquery
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.env.local` file:
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/database_name"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# BigQuery
BIGQUERY_PROJECT_ID="your-project-id"
GOOGLE_APPLICATION_CREDENTIALS="path/to/credentials.json"

# App Config
NEXT_PUBLIC_APP_NAME="170sa"
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Build & Run

#### Development
```bash
npm run dev
```

#### Production
```bash
npm run build
npm run start:prod
```

## 🚀 Deployment Options

### 1. Standard Node.js
```bash
npm run build
npm run start:prod
```

### 2. PM2 (Recommended for Production)
```bash
npm install -g pm2
npm run build
npm run pm2:start
```

### 3. Docker
```bash
docker build -t 170sa-analytics .
docker run -p 3000:3000 170sa-analytics
```

### 4. Cloud Platforms
- **Vercel:** `vercel --prod`
- **Railway:** Connect GitHub repo
- **DigitalOcean/AWS/GCP:** Use PM2 deployment

## 📱 Routes

### Public Routes
- `/` - Landing page
- `/login` - User authentication

### Protected Routes  
- `/overview` - Main dashboard
- `/monitor` - Real-time monitoring
- `/adser` - Ad server analytics
- `/users` - User management
- `/settings` - Configuration

### Special Routes
- `/newgate` - Registration (hidden endpoint)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/users` - Create user (admin only)
- `GET /api/auth/me` - Get current user

### Data
- `GET /api/data` - Fetch analytics data
- `GET /api/monitor` - Real-time monitoring data  
- `GET /api/overview` - Dashboard summary
- `GET /api/adser` - Ad server metrics

### Configuration
- `GET/PATCH /api/preferences` - User preferences
- `GET/POST /api/filters` - Data filters

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Protected API routes
- Hidden registration endpoint
- CORS configuration
- Environment variables protection

## 🎨 UI Components

- Modern glassmorphism design
- Dark/Light mode toggle
- Responsive data tables
- Interactive charts (Recharts)
- Custom date pickers
- Real-time notifications
- Loading states and skeletons

## 📊 Data Sources

- **Google BigQuery** - Primary analytics data
- **MySQL Database** - User management and preferences
- **Real-time APIs** - Live monitoring data
- **Exchange Rate API** - Currency conversion

## 🧪 Development Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Next.js production server
npm run start:prod   # Custom production server
npm run start:server # Server wrapper
npm run lint         # Code linting
```

## 🔧 PM2 Commands

```bash
npm run pm2:start    # Start with PM2
npm run pm2:stop     # Stop application
npm run pm2:restart  # Restart application
npm run pm2:delete   # Delete from PM2
```

## 📁 Project Structure

```
170sa-analytics/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Protected pages  
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
├── prisma/               # Database schema
├── public/               # Static assets
├── scripts/              # Utility scripts
├── types/                # TypeScript definitions
├── app.js                # Production server
├── ecosystem.config.js   # PM2 configuration
├── Dockerfile           # Docker configuration
└── deploy.md           # Deployment guide
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: newgate0424@gmail.com

## 🚀 Live Demo

Visit: [Your Deployment URL]

---

**Built with ❤️ by newgate0424**

*Last updated: January 2025*
