# Environment Variables Setup Guide

## Backend Environment Variables

Create a file named `.env` in the `backend/` folder with the following content:

```env
# Server
PORT=5000
NODE_ENV=development

# Database - MongoDB Compass (Local)
# This connects to your local MongoDB instance running on default port
MONGODB_URI=mongodb://localhost:27017/sport-booking

# If your MongoDB requires authentication, use this format instead:
# MONGODB_URI=mongodb://username:password@localhost:27017/sport-booking?authSource=admin

# JWT Secret Key (Change this to a random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d

# Email Configuration (Gmail SMTP - Free)
# To use Gmail:
# 1. Enable 2-Step Verification on your Google account
# 2. Generate an App Password: https://myaccount.google.com/apppasswords
# 3. Use that app password (not your regular password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password_here
EMAIL_FROM=noreply@sportbooking.com

# Stripe Configuration (Sandbox/Test Mode - Free)
# Get your test keys from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL
CLIENT_URL=http://localhost:3000

# File Upload Settings
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## Frontend Environment Variables

Create a file named `.env` in the `frontend/` folder with the following content:

```env
# API URL
VITE_API_URL=http://localhost:5000/api

# Stripe Publishable Key (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Quick Setup Steps

1. **Create Backend .env file:**
   ```bash
   cd backend
   # Create .env file and paste the backend configuration above
   ```

2. **Create Frontend .env file:**
   ```bash
   cd frontend
   # Create .env file and paste the frontend configuration above
   ```

3. **MongoDB Compass Connection:**
   - Make sure MongoDB is running locally
   - Open MongoDB Compass
   - Connect to: `mongodb://localhost:27017`
   - The database `sport-booking` will be created automatically when you first run the app

4. **Update the values:**
   - Replace `your_email@gmail.com` with your actual Gmail
   - Replace `your_gmail_app_password_here` with your Gmail app password
   - Replace Stripe keys with your actual test keys (or leave as placeholders for now)
   - Change `JWT_SECRET` to a random secure string

## MongoDB Compass Connection String

For MongoDB Compass, use this connection string:
```
mongodb://localhost:27017
```

Or if you want to connect directly to the database:
```
mongodb://localhost:27017/sport-booking
```

## Notes

- The `.env` files are already in `.gitignore`, so they won't be committed to git
- MongoDB will create the database automatically when the app first connects
- You can test the app without email/Stripe initially - just leave those values as placeholders

