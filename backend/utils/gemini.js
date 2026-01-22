const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load API Key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Analyzes game footage context and answers user questions
 * @param {string} title - Footage title
 * @param {string} analysisContext - The admin-provided analysis or pre-generated insights
 * @param {string} description - Footage description
 * @param {string} question - User's question
 * @returns {Promise<string>} AI Response
 */
exports.analyzeGameFootage = async (title, analysisContext, description, question) => {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        process.env.GEMINI_API_KEY === 'your_gemini_api_key_here' && console.warn('⚠️ GEMINI_API_KEY is still the placeholder.');
        return simulateReply(analysisContext, question);
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      Persona: You are a "World-Class Sports Performance Analyst" with a sharp eye for detail and a focus on tactical improvement.
      
      Footage Title: ${title}
      Footage Description: ${description}
      Admin's Expert Breakdown/Notes: "${analysisContext}"
      
      User's Specific Question: "${question}"
      
      Instructions for your response:
      1. INTEGRATE CONTEXT: Directly reference the "Admin's Expert Breakdown" in your answer. If the admin mentioned specific players, coordination, or faults, focus heavily on those.
      2. BE PROFESSIONAL & CRITICAL: Use sports terminology (e.g., "defensive transition", "spacing", "press", "formation").
      3. AVOID HALLUCINATION: If the Admin's notes are generic (e.g., "Good game"), and you cannot watch the video directly, acknowledge that: "Based on the overview notes provided, the team played well, but for a deeper tactical analysis, I recommend providing more specific performance notes or timestamps."
      4. STRATEGIZE: Provide 1-2 actionable tips for the NEXT game based on the breakdown.
      5. FORMATTING: Use bold text for key insights and bullet points for readability.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('❌ Gemini API Error:', error);
        return "I'm having a bit of a technical glitch. Please try asking again or check if the API key is valid.";
    }
};

// Fallback simulation (improved)
function simulateReply(context, question) {
    const q = question.toLowerCase();
    if (q.includes('improve') || q.includes('better')) {
        return `[SIMULATED] To improve based on this footage, you should focus on the key areas mentioned: ${context.substring(0, 50)}... Specifically, try working on your positioning and speed.`;
    }
    return `[SIMULATED] The analysis shows: ${context.substring(0, 100)}... This is a great reference for your team's progress.`;
}
