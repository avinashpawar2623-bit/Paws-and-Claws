# Paws and Claws MERN Migration

This repository contains:

- Original static HTML/CSS/JS pet store website assets (root-level files/folders)
- New MERN application:
  - `backend/` (Express + MongoDB API)
  - `frontend/` (React + Vite app)

## Quick Start

### 1) Configure Environment

Backend:

1. Copy `backend/.env.example` to `backend/.env`
2. Fill required values:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CLIENT_URL`
   - `CLOUDINARY_*` (for image upload)

Frontend:

1. Copy `frontend/.env.example` to `frontend/.env`
2. Set:
   - `VITE_API_URL=http://localhost:5000/api`

### 2) Install Dependencies

Backend:

- `cd backend && npm install`

Frontend:

- `cd frontend && npm install`

### 3) Run Apps

Backend:

- `cd backend && npm run dev`

Frontend:

- `cd frontend && npm run dev`

## Optional Seed Data

With a valid MongoDB connection:

- `cd backend && npm run seed`

Seed users:

- admin: `admin@pawsandclaws.local` / `Admin@123`
- vendor: `vendor@pawsandclaws.local` / `Vendor@123`
- customer: `customer@pawsandclaws.local` / `Customer@123`

## Implemented Feature Phases

- Phase 1: monorepo scaffold, Express security middleware, React routing layout
- Phase 2: auth (JWT), roles, protected routes, profile flow
- Phase 3: product CRUD, filter/search/pagination, Cloudinary upload flow
- Phase 4: cart and orders, checkout and order history UI
- Phase 5: reviews and admin/vendor dashboards
- Phase 6: backend validation/error normalization, seed script, docs refresh

## API Smoke Test Checklist

Use Postman/Thunder Client with a valid access token for protected endpoints.

### Health

- `GET /api/health` -> 200

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login` (store access/refresh tokens)
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`

### Users

- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/users` (admin only)

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (vendor/admin)
- `PUT /api/products/:id` (owner vendor/admin)
- `POST /api/products/:id/image` (vendor/admin)
- `POST /api/products/:id/reviews` (auth)
- `GET /api/products/:id/reviews`

### Cart + Orders

- `GET /api/cart`
- `POST /api/cart/add`
- `PUT /api/cart/update/:itemId`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/status` (admin)

### Reviews + Dashboards

- `DELETE /api/reviews/:id` (owner/admin)
- `GET /api/dashboard/admin` (admin)
- `GET /api/dashboard/vendor` (vendor/admin)

## Notes

- Backend can start without `MONGO_URI`, but data routes require a real DB.
- Static legacy website files are preserved and not removed.
