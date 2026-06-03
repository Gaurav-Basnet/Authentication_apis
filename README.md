# 🔐 Authentication API

A robust, production-ready authentication REST API built with **Node.js**, **Express**, and **MongoDB**. Features JWT-based access/refresh token flow, email OTP verification, account lockout protection, and role-based access control.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [Security Features](#security-features)

---

## ✨ Features

- **User Registration** with email OTP verification
- **Login** via email, username, or phone number
- **JWT Access & Refresh Token** flow
- **Account Lockout** after 5 failed login attempts (30-minute lock)
- **OTP Resend** with 60-second cooldown
- **Logout** with refresh token invalidation
- **Role-Based Access Control** middleware
- **Password Hashing** with bcrypt (12 salt rounds)

---

## 🛠 Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Runtime      | Node.js                        |
| Framework    | Express 5                      |
| Database     | MongoDB + Mongoose             |
| Auth         | JSON Web Tokens (jsonwebtoken) |
| Password     | bcrypt                         |
| Email        | Nodemailer                     |
| Templating   | EJS                            |
| Dev Tool     | Nodemon                        |

---

## 📁 Project Structure

```
authentication/
├── index.js                  # App entry point
├── package.json
├── .env                      # Environment variables (do not commit)
│
├── routes/
│   └── userRoute.js
│
├── controllers/
│   ├── useController.js      # Register, verifyEmail, resendOtp
│   ├── loginController.js    # Login, refreshToken
│   └── logoutController.js   # Logout
│
├── middleware/
│   ├── auth.js               # JWT authentication middleware
│   └── role.js               # Role-based authorization middleware
│
├── model/
│   └── user.js               # Mongoose User schema
│
├── utils/
│   └── jwt.js                # Token generation helpers
|
├── services/
│   └── mailservices.js       # Nodemailer OTP email service
│
└── views/                    # EJS templates
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB running locally (or a remote URI)

### Installation

```bash
# Clone the repository
git clone https://github.com/Gaurav-Basnet/Authentication_apis.git
cd authentication

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your values (see Environment Variables section)

# Start the development server
npm run dev
```

The server will start at `http://localhost:8000`.

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Email (used for sending OTPs)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# JWT Secrets (use long, random strings)
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

# Token Expiry
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
```

> ⚠️ **Never commit your `.env` file.** Add it to `.gitignore`.

---

## 📡 API Reference

### User Routes — `/user`

#### Register
```
POST /user/register
```
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "phoneNumber": "9800000000",
  "password": "SecurePass123"
}
```
**Response:** `201` — User created, OTP sent to email.

---

#### Verify Email
```
POST /user/verify-email
```
**Body:**
```json
{
  "email": "john@example.com",
  "otp": "483920"
}
```
**Response:** `200` — Email verified, account activated.

---

#### Resend OTP
```
POST /user/resend-otp
```
**Body:**
```json
{
  "email": "john@example.com"
}
```
**Response:** `200` — New OTP sent. (Rate-limited: once per 60 seconds.)

---

#### Login
```
POST /user/login
```
**Body:**
```json
{
  "login": "john@example.com",
  "password": "SecurePass123"
}
```
> `login` accepts email, username, or phone number.

**Response:** `200`
```json
{
  "success": true,
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "user": { "id", "firstName", "lastName", "username", "email", "phoneNumber" }
}
```

---

#### Refresh Token
```
POST /user/refresh-token
```
**Body:**
```json
{
  "refreshToken": "<refresh_jwt>"
}
```
**Response:** `200` — New `accessToken` returned.

---

### Profile

```
GET /user/profile
```

Returns the authenticated user's profile information.

#### Headers

```http
Authorization: Bearer <accessToken>
```

#### Example Request

```http
GET /user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Response

```json
{
  "success": true,
  "user": {
    "_id": "686f7b6a4d4d8f7e2b1c1234",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phoneNumber": "9800000000",
    "role": "user",
    "status": "active",
    "emailVerified": true,
    "phoneVerified": false,
    "lastLogin": "2026-06-03T08:30:12.000Z",
    "createdAt": "2026-06-01T10:15:30.000Z",
    "updatedAt": "2026-06-03T08:30:12.000Z"
  }
}
```

#### Response Codes

| Status Code | Description                     |
| ----------- | ------------------------------- |
| 200         | Profile retrieved successfully  |
| 401         | Missing or invalid access token |
| 404         | User not found                  |
| 500         | Internal server error           |

#### Notes

* Requires a valid JWT access token.
* User information is fetched directly from MongoDB using the authenticated user's ID.



#### Logout
```
POST /user/logout
```
**Body:**
```json
{
  "refreshToken": "<refresh_jwt>"
}
```
**Response:** `200` — Session invalidated.

---

### Protected Routes

Attach the access token as a Bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

The `authenticate` middleware validates this token on protected routes. The `authorizeRoles` middleware restricts access by role:

```js
router.get("/admin", authenticate, authorizeRoles("admin"), handler);
```

---

## 🔄 Authentication Flow

```
1. POST /register      → Account created (unverified), OTP emailed
2. POST /verify-email  → Account activated
3. POST /login         → Returns accessToken (15m) + refreshToken (7d)
4. [Use accessToken]   → Include in Authorization header for protected routes
5. POST /refresh-token → Get a new accessToken using refreshToken
6. POST /logout        → Invalidates the refreshToken
```

---

## 🛡 Security Features

| Feature | Detail |
|---|---|
| Password hashing | bcrypt with 12 salt rounds |
| Brute force protection | Account locked for 30 min after 5 failed logins |
| Token rotation | Refresh tokens stored per-session in DB; invalidated on logout |
| OTP expiry | Email OTPs expire after 10 minutes |
| OTP rate limiting | Resend allowed once every 60 seconds |
| Role-based access | Middleware restricts routes by user role |