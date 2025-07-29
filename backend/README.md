# 📘 Backend API Documentation

## Overview

This is the backend for a our platform that uses **Node.js**, **Express**, and **Supabase** as the database. It handles authentication, user management, travel destinations, alerting, and health monitoring. More to come soon...

- **Base URL**: `http://localhost:5000/api`
- **Database**: Supabase
- **Authentication**: JWT with refresh tokens
- **Environment**: Development (uses `.env` for configs)

---

## 🔐 Authentication (`/api/auth`)

### POST `/register`

Create a new user.

**Body**:

```json
{
  "email": "user@example.com",
  "password": "securePassword",
  "name": "John Doe"
}
```

**Returns**:

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

---

### POST `/login`

Authenticate user and return access/refresh tokens.

**Body**:

```json
{
  "email": "user@example.com",
  "password": "securePassword"
}
```

**Returns**:

```json
{
  "accessToken": "jwt-token",
  "refreshToken": "jwt-refresh-token",
  "user": { ... }
}
```

---

### POST `/refresh`

Use refresh token to issue new access token.

**Body**:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Returns**:

```json
{
  "accessToken": "new-jwt-token"
}
```

---

### POST `/logout`

Revokes all refresh tokens for the user.

---

## 👤 User Profile (`/api/auth/profile`)

### GET `/me`

Fetch current user’s full profile, including settings and profile data. Requires `Authorization` header.

---

### PATCH `/me`

Update user profile and/or settings.

**Body Example**:

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "bio": "Frequent traveler.",
  "theme": "light"
}
```

---

### PATCH `/me/password`

Update user password.

**Body**:

```json
{
  "newPassword": "newSecurePassword"
}
```

---

## 🌍 Destinations (`/api/destinations`)

> (Route added in backend)

Endpoints related to travel destinations and associated risk metrics. More detail required for full documentation, but assumed CRUD support:

### GET `/api/destinations`

Get a list of destinations.

---

### POST `/api/destinations`

Create a new destination. _(Admin only)_

---

### PUT `/api/destinations/:id`

Update destination by ID.

---

### DELETE `/api/destinations/:id`

Delete a destination.

---

## ⚠️ Alerts (`/api/alerts`)

For managing travel risk alerts associated with destinations or users.

### GET `/api/alerts`

List all alerts.

---

### POST `/api/alerts`

Create a new alert.

**Body Example**:

```json
{
  "destination_id": "uuid",
  "message": "Civil unrest in area",
  "severity": "high"
}
```

---

## 💡 Health Check (`/api/health`)

### GET `/api/health`

Used to verify that the backend is live and reachable.

**Returns**:

```json
{
  "status": "ok",
  "timestamp": "2025-07-29T12:34:56.789Z"
}
```

---

## 🔒 Authentication & Tokens

### Token Handling

- **Access Token**: Short-lived, used in `Authorization: Bearer <token>` header.
- **Refresh Token**: Stored securely on the client, used to get new access tokens.

### Token Storage

Refresh tokens are stored **hashed** in the `refresh_tokens` table with expiry timestamps.

---

## 🧠 Internal Architecture

- **Framework**: Express
- **Database**: Supabase (PostgreSQL)
- **Security**:

  - `helmet` for HTTP headers
  - `cors` for domain security
  - `bcryptjs` for password hashing

- **JWT Utility**: Custom class handles token generation
- **User Tables**:

  - `users`
  - `user_profile`
  - `user_settings`
  - `refresh_tokens`

---

## 🧪 Local Development

- Backend runs on: `http://localhost:5000`
- Frontend origin allowed: `http://localhost:3000` (can be configured with `.env`)
- Use `NODE_ENV=development` to enable dev-only features
- Run:

  ```bash
  npm install
  npm run dev
  ```

---

## ✅ API Status Route

### GET `/`

Returns a plain message confirming server is operational.

```text
✅ Backend is running...
```

---

## 📁 Folder Structure (Partial)

```
src/
├── app.js              # Express setup
├── server.js           # Entry point
├── routes/
│   ├── health-check.js
│   ├── auth.js
│   ├── destinations.js
│   └── alerts-routes.js
├── services/
│   └── AuthService.js
├── utils/
│   └── jwt.js
├── config/
│   └── database.js
```
