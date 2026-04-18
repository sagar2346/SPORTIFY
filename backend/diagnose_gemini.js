const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testConnection() {
    const result = dotenv.config();
    if (result.error) {
        console.error('Dotenv Error:', result.error);
    }

    console.log('Dotenv Parsed Keys:', Object.keys(result.parsed || {}));

    const rawKey = process.env.GEMINI_API_KEY;
    console.log('Raw Key: [' + rawKey + ']');

    const key = rawKey ? rawKey.trim() : null;
    console.log('Trimmed Key Length:', key ? key.length : 0);

    if (!key || key === 'your_gemini_api_key_here') {
        console.error('Error: GEMINI_API_KEY is not configured correctly in .env');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(key);

    try {
        console.log('--- Testing Content Generation ---');
        console.log('Model: gemini-1.5-flash');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        console.log('Sending test prompt...');
        const result = await model.generateContent("test");
        const response = await result.response;
        console.log('Response:', response.text());

    } catch (error) {
        console.error('Generation Failed!');
        console.dir(error, { depth: null });
        console.error('Error Message:', error.message);
    }
}

testConnection();
