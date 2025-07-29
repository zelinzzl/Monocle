![alt text](src\public\Logo.svg)

# Monocle

## 📢 Introduction

**Monocle** is a full-stack application developed during \[Hackathon Name / Date if applicable], designed to \[insert a 1-line description of your project’s purpose or problem it solves].

- **Frontend:** [Next.js](https://nextjs.org/)
- **Backend:** [Go](https://golang.org/)
- **Database:** [Supbase](https://supabase.com/)

---

## 🛠️ Tech Stack

| Layer      | Technology                               |
| ---------- | ---------------------------------------- |
| Frontend   | Next.js, TypeScript, TailwindCSS, Shadcn |
| Backend    | Go (Golang), Gin                         |
| Database   | Supabase                                 |
| Auth       |                                          |
| Deployment | Vercel                                   |

---

## 🧩 Architecture

```
monocle/
├── frontend/        # Next.js app
│   ├── pages/
│   ├── components/
│   └── public/

```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js >= 18.x
- Go >= 1.20
- Docker (optional)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Additional information: To use icon generation script

```bash
npm install --save-dev tsx
```

### Backend

```bash
cd backend
go mod init github.com/zelinzzl/hackathon-setup/backend
go mod tidy
go get -u github.com/gin-gonic/gin
```

Environment Variables

    Use .env.example as a template.

    Provide a .env file with all required environment variables before running the backend.

---

Starting the Backend
Windows

```bash
npm run setup-backend-start
npm run start-backend

MacOS / Linux

npm run setup-backend-start-MACOS
npm run start-backend

Alternatively, run directly:

cd backend
go run main.go
```

The backend will be available at http://localhost:8081.

---

## 🧐 Team Monocle

- **[Zelin]** – Team Lead & Fullstack

- **[Reta]** – Fullstack

---
