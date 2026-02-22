const axios = require('axios');

/**
 * Helper to call Gemini API directly via HTTP
 */
const callGeminiRaw = async (modelName, prompt) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'your_gemini_api_key_here') return null;

    // Using v1beta as it showed more availability in diagnostics
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;

    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        if (response.data && response.data.candidates && response.data.candidates[0].content) {
            return response.data.candidates[0].content.parts[0].text;
        }
        throw new Error('Invalid response structure from Gemini API');
    } catch (error) {
        const errorDetail = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error(`Gemini Raw API Error (${modelName}):`, errorDetail);
        throw error;
    }
};

/**
 * Analyzes game footage context
 */
exports.analyzeGameFootage = async (title, analysisContext, description, question) => {
    try {
        const prompt = `
            Persona: Sport Performance Analyst.
            Context: ${title} - ${description}. 
            Expert Notes: ${analysisContext}
            Question: ${question}
            Response: Concise, tactical, and helpful.
        `;
        return await callGeminiRaw('gemini-2.5-flash', prompt);
    } catch (error) {
        return "Tactical analysis is currently unavailable. Please check your API configuration.";
    }
};

/**
 * Generates summary
 */
exports.generateSummary = async (title, analysisContext, description) => {
    try {
        const prompt = `Provide a professional, point-wise tactical summary for this game footage: ${title}. Notes: ${analysisContext}. Description: ${description}. Use bullets.`;
        return await callGeminiRaw('gemini-2.5-flash', prompt);
    } catch (error) {
        return "Failed to generate tactical summary at this moment.";
    }
};

/**
 * Handles general chat
 */
exports.generateGeneralChat = async (question, context = {}) => {
    try {
        const prompt = `You are Sporty, a helpful AI assistant for Sportify. Question: ${question}. Context: ${JSON.stringify(context)}`;
        return await callGeminiRaw('gemini-2.5-flash', prompt);
    } catch (error) {
        return "I'm having trouble connecting to my sports database.";
    }
};
