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
            Task: Provide a professional analysis or answer based on the provided video context.
            
            Context Metadata:
            - Title: ${title}
            - Description: ${description}
            - Expert Notes: ${analysisContext}
            
            Question: ${question}
            
            Guidelines:
            1. Evaluate the context. If it is a sports match, act as a Sport Performance Analyst.
            2. If the video is NOT about sports (e.g., a concert, a movie, general chat), do NOT force a sports analysis. Describe what is actually happening based on the title/description honestly.
            3. Response Style: Professional, concise, and helpful.
            4. If the context is insufficient, politely state what you know and where you need more info.
        `;
        return await callGeminiRaw('gemini-flash-latest', prompt);
    } catch (error) {
        return "Analysis is currently unavailable. Please try again later.";
    }
};

/**
 * Generates summary
 */
exports.generateSummary = async (title, analysisContext, description) => {
    try {
        const prompt = `
            Task: Provide a professional, point-wise summary for this video footage.
            
            Details:
            - Title: ${title}
            - Expert Notes: ${analysisContext}
            - Description: ${description}
            
            Instructions:
            1. If this is sports footage, provide a "Tactical Summary" focusing on performance and strategy. 
            2. Do NOT include a main heading like "### Tactical Summary" or "# Summary" as the UI already provides a header. Start directly with the bullet points or analysis.
            3. If this is NOT sports (e.g., a concert or event), provide a general professional summary of the content. Do NOT invent sports tactics for non-sports videos.
            4. Format: Use Markdown bullets. Be concise.
        `;
        return await callGeminiRaw('gemini-flash-latest', prompt);
    } catch (error) {
        return "Failed to generate summary at this moment.";
    }
};

/**
 * Handles general chat
 */
exports.generateGeneralChat = async (question, context = {}) => {
    try {
        const prompt = `
            Persona: You are Sporty, a helpful AI assistant for Sportify (a sports venue booking platform). 
            
            System Instruction:
            1. ONLY answer questions related to Sportify, sports venues, bookings, tournaments, and common sports-related queries within the Sportify ecosystem.
            2. If a user asks about anything outside of this scope (e.g., general knowledge, politics, coding, personal advice, etc.), you MUST decline politely.
            3. Forbidden Response Style: Do NOT say "I don't know" - instead, say "I am not authorized to answer this question as it is outside the scope of Sportify. I can only help you with sports, bookings, and platform features."
            
            Question: ${question}
            Context: ${JSON.stringify(context)}
        `;
        return await callGeminiRaw('gemini-flash-latest', prompt);
    } catch (error) {
        return "I'm having trouble connecting to my sports database.";
    }
};

/**
 * Generates a summary of venue reviews
 */
exports.generateVenueReviewSummary = async (reviewsText) => {
    try {
        const prompt = `
            Task: Provide a concise, helpful summary of the following customer reviews for a sports venue.
            
            Reviews:
            ${reviewsText}
            
            Instructions:
            1. Summarize the overall sentiment (Positive, Neutral, or Negative).
            2. Highlight the key "Pros" (what people liked) and "Cons" (what people didn't like or suggested improvements for).
            3. Provide a "Bottom Line" recommendation for potential users.
            4. Keep it professional, objective, and easy to read.
            5. Use Markdown bullets for pros and cons.
            
            Format:
            ### AI Summary
            [Brief overall sentiment]
            
            **Pros:**
            - ...
            
            **Cons:**
            - ...
            
            **The Bottom Line:**
            [Concise recommendation]
        `;
        return await callGeminiRaw('gemini-flash-latest', prompt);
    } catch (error) {
        return "AI Summary is currently unavailable. Please check the individual reviews below.";
    }
};
