# 🍕 Slooze — Food Ordering App

Welcome to **Slooze**, a modern food ordering platform built for a take-home assignment! This full-stack app lets users browse restaurants, order food, and manage everything with role-based access control.

## ✨ What's Special

- **Role-Based Access**: Admins, Managers, and Members have different permissions
- **Country Scoping**: Users only see restaurants and orders from their country (except admins)
- **Secure Authentication**: JWT-based login with hashed passwords
- **Clean Architecture**: NestJS backend + Angular frontend, all in TypeScript

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Backend Setup
```bash
cd backend
npm install
npm run build
npm run start
```
Backend runs on `http://localhost:3000` with SQLite database (auto-seeded).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:4200` (proxies API calls to backend).

> **Pro Tip**: Start backend first, then frontend!

## 👥 Test Users

Login with these accounts to explore different roles:

- **Nick Fury** (Admin) - `nick@slooze.com` / `nick`
- **Captain Marvel** (Manager, India) - `marvel@slooze.com` / `marvel`
- **Captain America** (Manager, America) - `america@slooze.com` / `america`
- **Thanos** (Member, India) - `thanos@slooze.com` / `thanos`
- **Thor** (Member, India) - `thor@slooze.com` / `thor`
- **Travis** (Member, America) - `travis@slooze.com` / `travis`

## 🛠 Tech Stack

**Backend (NestJS)**
- TypeScript, TypeORM, SQLite
- JWT authentication, bcrypt passwords
- Global validation & error handling

**Frontend (Angular 17)**
- Standalone components, Bootstrap styling
- Lazy loading, HTTP interceptors
- Proxy config for smooth development

## 🎯 Features

- Browse restaurants by country
- Add items to cart, create orders
- Checkout & cancel orders (role-dependent)
- Manage payment methods (admin only)
- Responsive UI with clean design

## 📝 Notes

- Database auto-seeds on first run
- All passwords are lowercase first names
- Frontend proxies `/api/*` to backend
- Built for local development (SQLite)

Enjoy exploring Slooze! 🚀
