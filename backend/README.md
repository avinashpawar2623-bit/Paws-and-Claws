# Paws and Claws Backend

Express + MongoDB API for the Paws and Claws MERN application.

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud URI)

## Setup

1. Copy `.env.example` to `.env`
2. Set `MONGO_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`
3. Install dependencies:
   - `npm install`

## Run

- Development: `npm run dev`
- Production-like: `npm start`

## Seed Demo Data

With a valid `MONGO_URI` configured:

- `npm run seed`

Creates:
- admin: `admin@pawsandclaws.local` / `Admin@123`
- vendor: `vendor@pawsandclaws.local` / `Vendor@123`
- customer: `customer@pawsandclaws.local` / `Customer@123`

## API Base

- `http://localhost:5000/api`

## Implemented Modules

- Auth + users
- Products + image upload
- Cart + orders
- Reviews
- Admin/vendor dashboards

## Validation and Errors

- Request payload validation is handled with `express-validator`
- Error shape:
  - `success` (boolean)
  - `error` (error code string)
  - `message` (human-readable message)
  - `errors` (optional field-level validation errors)
