# Technology Stack

## Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React icons

## Backend
- Node.js
- Express
- Supabase JavaScript client
- Supabase PostgreSQL
- JSON Web Tokens (JWT)
- bcryptjs
- dotenv
- express-validator

## Database
The application uses Supabase-hosted PostgreSQL. The schema is in `backend/supabase/schema.sql` and creates `users`, `movies`, `shows`, and `bookings`.

## Project structure
```text
movie-ticket-booking/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   └── supabase/schema.sql
├── README.md
└── TECH_STACK.md
```
