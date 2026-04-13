# How to Fix 500 Email Send Error

The error `535 Authentication Credentials Invalid` means your Gmail App Password is no longer accepted. Follow these steps to generate a new one:

## Step 1: Enable 2-Step Verification
1.  Go to your [Google Account](https://myaccount.google.com/).
2.  Select **Security**.
3.  Under "How you sign in to Google," make sure **2-Step Verification** is **ON**.

## Step 2: Generate an App Password
1.  In the same **Security** tab, search for **App passwords**.
2.  Enter a name (e.g., "Sportify App").
3.  Click **Create**.
4.  Copy the **16-character password** (it will look like `vjjv tqwf hnes sbza`).

## Step 3: Update `.env` File
1.  Open your `backend/.env` file.
2.  Update the `EMAIL_PASS` field with the new password.
    *   **Recommendation**: Remove the spaces when pasting (e.g., `vjjvtqwfhnessbza`).
3.  Save the file.

## Step 4: Verify
1.  Run the diagnostic script in your terminal:
    ```bash
    cd backend
    node test_email_debug.js
    ```
2.  If it says "Server is ready to take our messages," the fix is working!

---

> [!NOTE]
> I am also updating the backend to provide clearer error messages so that if this happens again, the app will tell you to check your credentials instead of showing a "500 Error".
