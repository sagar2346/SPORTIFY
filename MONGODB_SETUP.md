# MongoDB Compass Setup Guide

## ✅ Environment Files Created!

Both `.env` files have been created with MongoDB Compass connection settings.

## MongoDB Connection String

The backend `.env` file is configured to connect to MongoDB Compass using:

```
MONGODB_URI=mongodb://localhost:27017/sport-booking
```

## Steps to Connect:

### 1. Start MongoDB
Make sure MongoDB is running on your local machine:
- If you installed MongoDB as a service, it should be running automatically
- If not, start it manually: `mongod` or start the MongoDB service

### 2. Open MongoDB Compass
- Open MongoDB Compass application
- Use this connection string: `mongodb://localhost:27017`
- Click "Connect"

### 3. Verify Connection
- You should see your local MongoDB instance
- The database `sport-booking` will be created automatically when you first run the backend server

### 4. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

## If MongoDB Requires Authentication

If your MongoDB instance requires authentication, update the connection string in `backend/.env`:

```env
MONGODB_URI=mongodb://username:password@localhost:27017/sport-booking?authSource=admin
```

Replace:
- `username` with your MongoDB username
- `password` with your MongoDB password

## Troubleshooting

### MongoDB Not Running
- **Windows**: Check Services (services.msc) for "MongoDB" service
- Start it if it's not running
- Or install MongoDB if you haven't: https://www.mongodb.com/try/download/community

### Connection Refused
- Make sure MongoDB is running on port 27017 (default)
- Check firewall settings
- Verify MongoDB service is started

### Database Not Created
- The database will be created automatically on first connection
- Make sure the backend server can connect successfully

## Testing the Connection

1. Start the backend server
2. Check the console for: `✅ MongoDB connected successfully`
3. Open MongoDB Compass and verify the `sport-booking` database appears
4. Collections will be created as you use the application

