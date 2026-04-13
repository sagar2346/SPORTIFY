# Sportify - Online Sport Booking System

A premium, full-stack MERN application for booking and managing sports venues, featuring AI analysis, real-time communication, and secure payments.

---

## 🌟 Key Features

- **Venue Booking**: Interactive discovery and booking of sports facilities.
- **AI-Powered Analysis**: Tactical summaries and footage analysis using Google Gemini.
- **Secure Payments**: Integrated eSewa and Stripe gateways.
- **Real-time Chat**: Seamless coordination via Socket.io.
- **KYC Verification**: Identity verification for venue owners and users.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: (v16.0.0 or higher)
- **MongoDB**: Running locally on `mongodb://localhost:27017/sport-booking`

### Installation
From the root directory, run:
```bash
npm install
```
*This command automatically initializes both frontend and backend dependencies.*

### Running the App
```bash
npm run dev
```
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:5001](http://localhost:5001)

---

## 🧪 Testing Protocol (19 Core Tests)

The project includes 19 critical verification tests to ensure system integrity. These should be run in the following precise order:

### 🛠️ Phase 1: Environment & Infrastructure
1.  **`check_env.js`**: Verifies presence of all required `.env` variables.
2.  **`check_env_format.js`**: Validates the syntax and format of configuration files.
3.  **`diagnose_env.js`**: Comprehensive diagnostic of the local execution environment.
4.  **`test_db_connection.js`**: Confirms backend connectivity to MongoDB.
5.  **`test_email_debug.js`**: Verifies SMTP settings for transactional emails.
6.  **`diagnose_gemini.js`**: Validates the AI API key and connectivity.

### 📦 Phase 2: Data & User Initialization
7.  **`seed_venues.js`**: Populates the database with initial venue data.
8.  **`create_admin.js`**: Manually creates the primary administrative account.
9.  **`test_admin_signup.js`**: Verifies the administrative registration API endpoint.
10. **`setup_test_user.js`**: Initializes a standard trial user for functional testing.

### 🔐 Phase 3: Authentication & Security
11. **`test_login_api.js`**: Validates standard email/password authentication.
12. **`test_auth_flow.js`**: Tests the full login, session, and logout lifecycle.
13. **`test_kyc_enforcement.js`**: Ensures unverified users are restricted appropriately.

### 🏟️ Phase 4: Core Logic & Features
14. **`check_slots.js`**: Verifies the venue availability and slot calculation logic.
15. **`setup_notify_test.js`**: Prepares mock data for real-time alert testing.
16. **`verify_notification_api.js`**: Tests the delivery of real-time Socket.io notifications.
17. **`verify_summary.js`**: Validates the AI-generated summaries for sports venues.
18. **`esewa_test_api.js`**: Tests the payment gateway integration.
19. **`test_new_features.js`**: Final regression test for the latest platform updates.

### ⚡ Running Tests
To run the entire suite automatically:
```bash
npm test
```
To run a specific test manually:
```bash
cd backend && node <test_file_name>.js
```

---

## 🛠️ Troubleshooting

- **MongoDB Issues**: Ensure `mongod` is running. Check `MONGODB_URI` in `backend/.env`.
- **Port Conflicts**: Port `3000` (Vite) and `5001` (Express) must be available.
- **AI Key**: Ensure `GEMINI_API_KEY` is valid for AI features to function.

---
© 2026 Sportify Project. Built for visual excellence and performance.
