const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function findWorkingModel() {
    const key = process.env.GEMINI_API_KEY;
    const models = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-pro',
        'gemini-1.5-flash-8b'
    ];

    console.log('--- Probing Models ---');
    for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        try {
            const res = await axios.post(url, {
                contents: [{ parts: [{ text: "hi" }] }]
            });
            if (res.status === 200) {
                console.log(`${model} WORKS!`);
                return model;
            }
        } catch (err) {
            console.log(` ${model} FAILED: ${err.response?.status || err.message}`);
        }
    }
    console.log('--- No standard models worked ---');
    return null;
}

findWorkingModel();
