// backend/services/geminiService.js
import { GoogleGenAI } from '@google/genai';

let aiClient = null;

export function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

export async function askEpmsCoach({ message, context = {}, role = 'EMPLOYEE' }) {
  const client = getGeminiClient();

  if (!client) {
    // Intelligent banking coach fallback response
    return `[Bunna EPMS Executive Coach - Offline Advisory Mode]\n` +
      `Regarding your inquiry on "${message}":\n` +
      `Under Bunna Bank's 300-banking-day annual operating framework, daily targets require consistent pacing.\n` +
      `Key Strategy:\n` +
      `1. Focus on early-morning corporate and merchant deposit mobilization.\n` +
      `2. Cross-sell Bunna Mobile Banking and ATM cards at account opening.\n` +
      `3. Target foreign remittance corridors (Western Union, MoneyGram, Ethio-Direct) for foreign currency inflows.\n` +
      `Keep your daily submission submitted by 4:00 PM for branch manager review!`;
  }

  try {
    const systemInstruction = `
      You are the Bunna Bank Executive Performance Management System (EPMS) AI Coach.
      You provide senior-level banking insights, operational performance guidance, and strategic advice.
      Context:
      User Role: ${role}
      Operating Framework: 300 banking days per annual cycle.
      Core KPIs: Net Deposits (ETB), Foreign Currency Inflows (USD), Digital Financial Services (ETB), Customer Onboarding (CASA), Mobile/Internet Banking, ATM cards, Merchant POS.
      Provide concise, highly professional, encouraging and actionable banking advice.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    return response.text;
  } catch (err) {
    console.error('[Gemini AI Coach Error]:', err.message);
    return `Advisory recommendation for ${role}: Prioritize key deposit and digital adoption metrics to meet your daily prorated benchmark (annual / 300 banking days).`;
  }
}

export default {
  getGeminiClient,
  askEpmsCoach
};
