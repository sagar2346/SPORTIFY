/**
 * eSewa v2 Integration Test API for Node.js
 * 
 * Based on standard eSewa v2 requirements:
 * 1. Generate an HMAC SHA256 signature using the secret key.
 * 2. Send the required form data to eSewa's endpoint.
 * 3. Handle the base64 encoded response on the success callback.
 * 
 * To run this test server:
 * cd c:\Users\LENOVO\Desktop\SPORTIFY\backend
 * node esewa_test_api.js
 */

const crypto = require('crypto');
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// eSewa Test Credentials
const ESEWA_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const SECRET_KEY = "8gBm/:&EnhH.1/q"; // Standard eSewa test secret key
const MERCHANT_CODE = "EPAYTEST";

// Helper to generate HMAC SHA256 signature
function generateSignature(total_amount, transaction_uuid, product_code, secret) {
    const message = `${total_amount},${transaction_uuid},${product_code}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(message);
    return hmac.digest('base64');
}

// 1. Route to initiate payment (renders a form that auto-submits, or you can click "Pay")
app.get('/api/esewa/initiate', (req, res) => {
    const amount = 100; // Test amount
    const tax_amount = 0;
    const total_amount = amount + tax_amount;
    const transaction_uuid = `test-${Date.now()}`;
    const product_code = MERCHANT_CODE;
    
    // Generate signature
    const signature = generateSignature(total_amount, transaction_uuid, product_code, SECRET_KEY);
    
    // HTML form to submit to eSewa
    const formHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>eSewa Payment Test</title>
            <style>
                body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f9; }
                .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center; }
                button { background-color: #61bb46; color: white; padding: 10px 20px; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
                button:hover { background-color: #4da638; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>eSewa Test Payment</h2>
                <p>Amount: Rs. ${total_amount}</p>
                <form action="${ESEWA_URL}" method="POST" id="esewa_form">
                    <input type="hidden" id="amount" name="amount" value="${amount}" required>
                    <input type="hidden" id="tax_amount" name="tax_amount" value="${tax_amount}" required>
                    <input type="hidden" id="total_amount" name="total_amount" value="${total_amount}" required>
                    <input type="hidden" id="transaction_uuid" name="transaction_uuid" value="${transaction_uuid}" required>
                    <input type="hidden" id="product_code" name="product_code" value="${product_code}" required>
                    <input type="hidden" id="product_service_charge" name="product_service_charge" value="0" required>
                    <input type="hidden" id="product_delivery_charge" name="product_delivery_charge" value="0" required>
                    <input type="hidden" id="success_url" name="success_url" value="http://localhost:4000/api/esewa/success" required>
                    <input type="hidden" id="failure_url" name="failure_url" value="http://localhost:4000/api/esewa/failure" required>
                    <input type="hidden" id="signed_field_names" name="signed_field_names" value="total_amount,transaction_uuid,product_code" required>
                    <input type="hidden" id="signature" name="signature" value="${signature}" required>
                    <button type="submit">Pay via eSewa</button>
                </form>
            </div>
        </body>
        </html>
    `;
    res.send(formHtml);
});

// 2. Success Callback
app.get('/api/esewa/success', (req, res) => {
    // eSewa sends data in base64 encoded 'data' query param in v2
    const { data } = req.query;
    if (data) {
        try {
            const decodedData = Buffer.from(data, 'base64').toString('utf-8');
            const parsedData = JSON.parse(decodedData);
            console.log("Payment Success Callback Received:", parsedData);
            
            // Here you would typically verify the signature of the incoming response again for security
            
            res.send(`
                <div style="font-family: sans-serif; padding: 20px;">
                    <h1 style="color: green;">Payment Successful!</h1>
                    <h3>Decoded Response from eSewa:</h3>
                    <pre style="background: #eee; padding: 15px; border-radius: 5px;">${JSON.stringify(parsedData, null, 2)}</pre>
                    <a href="/api/esewa/initiate">Try another payment</a>
                </div>
            `);
        } catch (error) {
            console.error("Error decoding eSewa success data:", error);
            res.status(500).send("<h1>Error decoding response data</h1>");
        }
    } else {
        res.send("<h1>Payment Success route hit, but no data received.</h1>");
    }
});

// 3. Failure Callback
app.get('/api/esewa/failure', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; padding: 20px; text-align: center;">
            <h1 style="color: red;">Payment Failed or Cancelled!</h1>
            <a href="/api/esewa/initiate">Try again</a>
        </div>
    `);
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`eSewa Test API is running on http://localhost:${PORT}`);
    console.log(`Initiate a test payment at: http://localhost:${PORT}/api/esewa/initiate`);
    console.log(`===================================================`);
});
