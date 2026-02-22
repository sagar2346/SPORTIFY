require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('API Key missing in .env');
        return;
    }

    // Using simple fetch to list models as SDK might not have a direct listModels method in all versions
    const fetch = require('node-fetch'); // If available, otherwise we use standard https
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('API Error:', data.error);
            return;
        }

        console.log('--- Available Models ---');
        data.models.forEach(m => {
            console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(', ')})`);
        });
    } catch (error) {
        // Fallback if node-fetch is not installed
        const https = require('https');
        https.get(url, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const data = JSON.parse(body);
                if (data.error) {
                    console.error('API Error:', data.error);
                } else {
                    console.log('--- Available Models ---');
                    data.models.forEach(m => {
                        console.log(`- ${m.name}`);
                    });
                }
            });
        }).on('error', e => console.error(e));
    }
}

listModels();
