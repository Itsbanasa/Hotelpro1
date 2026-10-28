# HotelPro

Public room browsing and guest bookings, with an optional register/login API and a demo admin dashboard. No route requires authentication.

## Run locally

1. Start MongoDB, then in `server` run `npm install`, copy `.env.example` to `.env`, and run `npm run dev`.
2. In `client` run `npm install` and `npm run dev`.
3. Open http://localhost:5173. The API listens at http://localhost:5000.

Booking dates use hotel nights (check-out must be later than check-in); overlapping active dates for a room are rejected. This demo intentionally leaves the admin and write APIs public as requested. Add authentication and authorization before using it with real customer data.
