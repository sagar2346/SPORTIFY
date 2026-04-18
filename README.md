# SPORTIFY - Ultimate Online Sport Booking & Management System

SPORTIFY is a comprehensive, full-stack web application designed to bridge the gap between sports venue owners and athletes. Whether you are looking to book a futsal court, register for a tournament, or manage a sports facility, SPORTIFY provides a seamless and automated experience.

---

## 🚀 Key Features

### 👤 Multi-Role Architecture
- **Admin**: Oversee the entire ecosystem, manage users, verify KYC, and monitor platform health.
- **Venue Owner (Partner)**: List facilities, manage inventory, view real-time booking analytics, and verify customer check-ins.
- **Player (Customer)**: Discover nearby venues, book slots, join teams, and register for tournaments.

### ⚽ Real-Time Booking System
- **Dynamic Slot Management**: View real-time availability and book slots instantly.
- **Automated Ticketing**: Receive professional PDF tickets with unique QR codes for secured entry.
- **Payment Integration**: Secure transactions via **Stripe** and **eSewa** gateways.

### 🤖 AI-Powered Experience
- **Smart Assistant**: Gemini-powered AI widget for instant support and booking guidance.
- **Advanced Analytics**: AI-driven insights for venue performance and player engagement.

### 🌐 Community & Collaboration
- **Team Management**: Form teams, chat with teammates, and manage registrations collectively.
- **Real-Time Notifications**: Instant updates on booking status, team invites, and tournament news.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS & Framer Motion (Animations)
- **State/Routing**: React Router & Axios
- **Visualization**: Recharts & React Leaflet (Interactive Maps)
- **Communication**: Socket.io-client

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-Time**: Socket.io
- **AI Integration**: Google Generative AI (Gemini)
- **Payments**: Stripe & eSewa SDKs
- **File Processing**: PDFKit & QRCode

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or on Atlas)
- NPM or Yarn

### 1. Clone the Repository
```bash
git clone https://github.com/sagar2346/SPORTIFY.git
cd SPORTIFY
```

### 2. Backend Configuration
Navigate to the `backend` directory and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add the necessary environment variables (e.g., `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `GEMINI_API_KEY`).

**Backend Port**: Runs on [http://localhost:5001](http://localhost:5001)

Run the server:
```bash
npm run dev
```

### 3. Frontend Configuration
Navigate to the `frontend` directory and install dependencies:
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` directory for any required React environment variables.

**Frontend Port**: Runs on [http://localhost:5173](http://localhost:5173)

Run the application:
```bash
npm run dev
```

---

## 🏗 Project Architecture

SPORTIFY follows a MERN stack architecture with a focus on real-time event-driven communication. The backend serves a RESTful API and handles WebSocket connections for instant updates, while the frontend provides a rich, responsive interface with separate dashboards tailored to different user roles.

---

## 📝 License
This project is developed for academic/professional submission. Please check the `package.json` for specific dependency licensing.

---

*Made with ❤️ for the Sports Community.*
