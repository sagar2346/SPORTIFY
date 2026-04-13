# 🏆 Sportify Loyalty Points System

The **Loyalty Points System** is designed to reward active players for booking venues through the Sportify platform. Every booking contributes to a player's points balance, which can be seen in their profile.

---

## 💡 How It Works

### 1. Earning Points
Players earn points automatically for every successfully **Confirmed** booking. 
- **Earn Rate**: 5% of the total booking price.
- **Example**: If a booking costs ** रू 1,000**, the player earns **50 points**.

### 2. The Trigger
Points are **NOT** awarded at the time of booking request. They are added to the user's account only when:
1. The **Admin** or **Venue Owner** reviews the payment.
2. The booking status is changed to **Confirmed**.

### 3. Tracking Points
Users can view their current balance by navigating to their **Profile** page. The balance is updated in real-time as bookings are confirmed.

---

## 🛠️ How to Test It

### Method 1: Manual UI Test (Recommended)
Follow these steps to see the points in action:

1.  **Log in as a Customer**:
    - Go to any venue and create a new booking.
    - Note your current "Loyalty points" in your **Profile** before starting.
2.  **Log in as an Admin**:
    - Credentials: `xyz@gmail.com` / `xyzxyzxyz`
    - Go to the **Admin Dashboard** -> **Bookings** (or Customer Support/Messages if verifying payment).
    - Find the "Pending" booking you just created and click **Confirm**.
3.  **Verify**:
    - Switch back to the **Customer** account.
    - Go to your **Profile** page.
    - You should see your points balance has increased by 5% of that booking's price.

### Method 2: Automated Backend Test
You can run a pre-written test script that simulates a full booking flow and verifies the points calculation.

**Run this command in your terminal:**
```bash
cd backend
node test_new_features.js
```
*This script will connect to your database, create a test user/venue, simulate a confirmed booking, and verify that exactly 5% points were awarded.*

---

## 🚀 Future Roadmap
The current system provides the foundation for:
- **Redemption**: Using points to get discounts on future bookings.
- **Tiers**: Unlocking "Elite" status for users with high point balances.
- **Rewards**: Exclusive access to tournament registrations.

---
> [!TIP]
> To adjust the reward percentage, look for `pointsAwarded` calculation in `backend/controllers/bookingController.js` around line 309.
