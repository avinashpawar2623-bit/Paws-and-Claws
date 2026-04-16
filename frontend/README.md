# Paws and Claws Frontend

React (Vite) frontend for the Paws and Claws MERN application.

## Setup

1. Copy `.env.example` to `.env`
2. Ensure API URL is configured:
   - `VITE_API_URL=http://localhost:5000/api`
3. Install dependencies:
   - `npm install`

## Run

- Development: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run preview`

## Implemented Features

- Auth flow (register/login/logout, protected routes)
- Product listing/detail/search/filter/sort/pagination
- Vendor/admin product creation with image upload
- Cart management and checkout
- Order history and details
- Product reviews (add/list/delete owner/admin)
- Admin/vendor dashboard pages

## Error Handling

- API requests use a centralized axios client in `src/services/api.js`
- Unified message extraction helper:
  - `getApiErrorMessage(error, fallback)`
