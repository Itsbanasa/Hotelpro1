# HotelPro

[![Open the live HotelPro website](https://img.shields.io/badge/OPEN%20HOTELPRO-Live%20Website-344b3c?style=for-the-badge)](https://hotelpro-narendra.vercel.app/)

**Live website:** [hotelpro-narendra.vercel.app](https://hotelpro-narendra.vercel.app/)

Public room browsing and guest bookings, with an optional register/login API and a demo admin dashboard. No route requires authentication.



### Open https://github.com/Itsbanasa/Hotelpro1





## Run locally

1. Start MongoDB, then in `server` run `npm install`, copy `.env.example` to `.env`, and run `npm run dev`.
2. In `client` run `npm install` and `npm run dev`.
3. Open http://localhost:5173. The API listens at http://localhost:5000.

Booking dates use hotel nights (check-out must be later than check-in); overlapping active dates for a room are rejected. Guest booking is always available without an account. The demo management dashboard and room-write endpoints remain public; add role-based authorization before using them with real customer data.

## Vercel deployment

The Vite app serves its API through the serverless function in `client/api`. Configure `MONGO_URI` and a strong `JWT_SECRET` in the Vercel project’s Environment Variables for Production, Preview, and Development, then redeploy. The database cluster must allow network access from Vercel. Never commit `.env` files or database credentials.
