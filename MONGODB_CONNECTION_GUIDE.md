# MongoDB Server Connection Guide

## Connection String Formats

### Option 1: MongoDB Atlas (Cloud - Free Tier)
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sport-booking?retryWrites=true&w=majority
```

### Option 2: Remote MongoDB Server
```
MONGODB_URI=mongodb://username:password@your-server-ip:27017/sport-booking?authSource=admin
```

### Option 3: Local MongoDB (Current)
```
MONGODB_URI=mongodb://localhost:27017/sport-booking
```

## How to Get Your Connection String

### For MongoDB Atlas:
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a cluster (free tier available)
4. Click "Connect" on your cluster
5. Choose "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database password
8. Replace `<dbname>` with `sport-booking` or keep your database name

### For Remote MongoDB Server:
1. Get your server IP address or domain
2. Get your MongoDB username and password
3. Use the format: `mongodb://username:password@server-ip:27017/sport-booking`

## Update Your .env File

Edit `backend/.env` and update the `MONGODB_URI` line with your connection string.

