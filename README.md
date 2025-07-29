![alt text](src/public/Logo.svg)

# Monocle

## 📢 Introduction

**Monocle** is a full-stack Travel Risk Monitoring application developed for the **Monkey & River 2025 Virtual Hackathon**. The application helps users monitor travel destinations and assess risk levels for safer travel planning.

- **Frontend:** [Next.js](https://nextjs.org/) with React & TypeScript
- **Backend:** [Node.js](https://nodejs.org/en) with Express
- **Database:** [Supabase](https://supabase.com/)
- **Authentication:** JWT tokens

---

## 🛠️ Tech Stack

| Layer      | Technology                               |
| ---------- | ---------------------------------------- |
| Frontend   | Next.js, TypeScript, TailwindCSS, React |
| Backend    | Node.js, Express                         |
| Database   | Supabase (PostgreSQL)                    |
| Auth       | JWT tokens                               |
| Deployment | Vercel                                   |
| Testing    | Cypress                                  |

---

## 🧩 Architecture

```
monocle/
├── frontend/           # Next.js app
│   ├── pages/         # App pages and API routes
│   ├── components/    # Reusable React components
│   ├── public/        # Static assets
│   └── styles/        # TailwindCSS styles
├── backend/           # Node.js Express server
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth and validation middleware
│   ├── models/        # Database models
│   └── utils/         # Helper functions
└── cypress/           # E2E tests
    ├── e2e/
    └── support/
```

---

## ✨ Features

### Required Challenge Features

1. **User Profile & Preferences**
   - View and edit user profile (name, email, password)
   - Manage notification settings and risk level thresholds
   - Persistent settings stored in database

2. **Alerts / Notifications Dashboard**
   - Display travel risk alerts with timestamps, titles, and status
   - Real-time notifications for destination risk changes
   - Alert history and management

3. **Monitored Destinations CRUD**
   - **Create**: Add new travel destinations to monitor
   - **Read**: View all monitored destinations with risk levels
   - **Update**: Modify destination details and risk assessments
   - **Delete**: Remove destinations from monitoring list
   - Fields: id, location, riskLevel, lastChecked

### Authentication & Authorization
- JWT-based authentication system
- Protected routes requiring valid tokens
- Secure user registration and login flow

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js >= 18.x
- npm or yarn package manager
- Supabase account and project

### Environment Variables

Create a `.env.local` file in the root directory using `.env.example` as a template:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Install icon generation script dependencies
npm install --save-dev tsx

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Backend Setup

```bash
# Install backend dependencies
cd backend
npm install

# Start the backend server
npm run start
```

The backend API will be available at `http://localhost:8081`.

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and API keys to your `.env.local` file
3. Run the database migrations:

```bash
npm run db:migrate
```

---

## 🧪 Testing

We use Cypress for end-to-end testing to ensure all functionality works correctly.

### Running Tests

```bash
# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run tests in headless mode
npm run cypress:run

# Run specific test suite
npm run test:auth
npm run test:crud
npm run test:dashboard
```

### Test Coverage

Our test suite covers:

- **Authentication Flow**: Login/logout, protected routes, JWT token handling
- **Database Operations**: CRUD operations for monitored destinations
- **User Profile**: Profile updates and preferences management
- **Alerts Dashboard**: Alert display and status management
- **Core Functionality**: All required challenge features

### Test Results

After running tests, results are automatically saved to `/cypress/results/` directory. Submit these alongside your repository.

---

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/preferences` - Update user preferences

### Monitored Destinations
- `GET /api/destinations` - Get all monitored destinations
- `POST /api/destinations` - Create new destination
- `PUT /api/destinations/:id` - Update destination
- `DELETE /api/destinations/:id` - Delete destination

### Alerts
- `GET /api/alerts` - Get user alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id/status` - Update alert status

### Health Check
- `GET /api/health` - Database connectivity health check

---

## 👥 Team Monocle

- **Zelin** – Team Lead & Full-stack Developer
- **Reta** – Full-stack Developer  
- **Siyamthanda** – Full-stack Developer
- **Nerina** – Full-stack Developer
- **Hawa** – Full-stack Developer

---

## 🔗 Links

- **Repository**: [GitHub Link]
- **Live Demo**: [Deployment Link]
- **Challenge**: Travel Risk Monitoring

---

