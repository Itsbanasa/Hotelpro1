# HotelPro

[![Open the live HotelPro website](https://img.shields.io/badge/OPEN%20HOTELPRO-Live%20Website-344b3c?style=for-the-badge)](https://hotelpro-narendra.vercel.app/)

**Live website:** [hotelpro-narendra.vercel.app](https://hotelpro-narendra.vercel.app/)

Public room browsing and guest bookings, with an optional register/login API and a demo admin dashboard. No route requires authentication.



### Open https://github.com/Itsbanasa/Hotelpro1





## Run locally

1. Install dependencies in both `client` and `server` with `npm install`.
2. In `server`, copy `.env.example` to `.env` and set `MONGO_URI` and a long random `JWT_SECRET`. Sample rooms are inserted only when the `hotelpro` database has no rooms; set `SEED_SAMPLE_ROOMS=false` to disable this.
3. Start the API with `npm run dev` from `server`, then start the client with `npm run dev` from `client` in a second terminal.
4. Open http://localhost:5173. Vite proxies `/api` requests to the API at http://localhost:5000.

Booking dates use hotel nights (check-out must be later than check-in); overlapping active dates for a room are rejected. Guest booking is always available without an account. The demo management dashboard and room-write endpoints remain public; add role-based authorization before using them with real customer data.

## Vercel deployment

The Vite app serves its API through the serverless function in `client/api`. Set `MONGO_URI` and a strong `JWT_SECRET` in the Vercel project's Environment Variables, then redeploy. The Atlas database user must have `readWrite` access to the `hotelpro` database, and the cluster's IP access list must include the deployment's egress addresses. The API health endpoint connects to MongoDB before reporting healthy. Never commit `.env` files or database credentials.
