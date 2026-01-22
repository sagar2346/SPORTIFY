# How to Update MongoDB Connection String

## ✅ Your .env file has been updated!

The `backend/.env` file now includes a template for MongoDB Server connection.

## 📝 To Connect to Your MongoDB Server:

### Step 1: Open the .env file
Navigate to: `backend/.env`

### Step 2: Find this line:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sport-booking?retryWrites=true&w=majority
```

### Step 3: Replace with your actual connection string

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign in to your account
3. Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `<dbname>` with `sport-booking` (or your preferred database name)

**Example:**
```env
MONGODB_URI=mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/sport-booking?retryWrites=true&w=majority
```

#### Option B: Remote MongoDB Server
```env
MONGODB_URI=mongodb://username:password@your-server-ip:27017/sport-booking?authSource=admin
```

#### Option C: Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/sport-booking
```

## 🔒 Security Note
- Never commit your `.env` file to git (it's already in `.gitignore`)
- Keep your password secure
- Use environment variables in production

## ✅ Test Your Connection

After updating the connection string, start your server:
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

If you see an error, check:
1. Your connection string is correct
2. Your MongoDB server is accessible
3. Your username and password are correct
4. Your IP is whitelisted (for Atlas)

