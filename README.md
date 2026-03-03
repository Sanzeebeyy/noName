# noName – Minimal Global Chat App

A simple, modern real-time chat application built with **FastAPI** and **React**.

Users can register, log in, and send messages in a single global chat room. Messages persist for 60 minutes and the app is designed to be lightweight and minimal.

---

## Features

* User registration & login (JWT authentication)
* Single global chat room
* Anyone can view messages
* Only authenticated users can send messages
* 60-minute message persistence
* Screenshot disabled on frontend (client-side)
* WebSocket real-time updates
* Health check endpoint for uptime monitoring
* Deployed on Render

---

## Tech Stack

### Backend

* FastAPI
* SQLAlchemy
* SQLite
* WebSockets
* JWT Authentication
* Uvicorn

### Frontend

* React
* Modern minimal UI design
* Fetch API / Axios
* WebSocket client

### Deployment

* Render (Backend)
* UptimeRobot (Keep-alive monitoring)

---

## Project Structure

```
backend/
 ├── main.py
 ├── routers/
 │     ├── auth.py
 │     ├── messages.py
 │     └── health.py
 ├── models.py
 ├── schemas.py
 ├── database.py

frontend/
 ├── src/
 │     ├── components/
 │     ├── pages/
 │     └── App.jsx
```

---

## API Endpoints

### Authentication

* `POST /register`
* `POST /login`

### Messages

* `GET /messages` → View messages (requires authentication)
* WebSocket `/ws` → Real-time chat

### Health Check

* `GET /health`
* `HEAD /health`

Used by UptimeRobot to prevent server sleep.

---

## How It Works

* Users authenticate and receive a JWT.
* Authenticated users can send messages.
* All users can view messages.
* Messages are stored in SQLite.
* A cleanup mechanism removes messages older than 60 minutes.
* WebSocket broadcasts new messages instantly to all connected clients.
* UptimeRobot pings `/health` every 5 minutes to keep the Render server awake.

---

## Running Locally

### Backend

```bash
uvicorn main:app --reload
```

### Frontend

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` (or port Vite shows) to see the chat app.

---

## Notes

* Minimal modern UI style.
* Single global room only.
* Intended as a college-level fun project.
* Messages auto-delete after 60 minutes.

---

## License

MIT License
