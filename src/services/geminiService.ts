import { GoogleGenAI, Type } from "@google/genai";
import { QuotationData } from "../types";

const getApiKey = () => localStorage.getItem('GEMINI_API_KEY') || process.env.GEMINI_API_KEY || "";
const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

const QUOTATION_SCHEMA: any = {
  type: Type.OBJECT,
  properties: {
    clientName: { type: Type.STRING, description: "Full name of the client" },
    finalAmount: { type: Type.NUMBER, description: "Total quotation amount" },
    preWeddingDeliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
    functions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          date: { type: Type.STRING },
          name: { type: Type.STRING },
          time: { type: Type.STRING, description: "Time range, e.g., 10:00 AM to 12:00 PM" },
          services: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of requirements like Traditional Photography, Cinematography, etc." }
        }
      }
    },
    finalDeliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
    paymentSchedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          date: { type: Type.STRING },
          step: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          status: { type: Type.STRING }
        }
      }
    },
    termsPhotoshoot: { type: Type.ARRAY, items: { type: Type.STRING } },
    termsDeliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
    termsAlbum: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["clientName", "finalAmount", "functions", "finalDeliverables"]
};

export async function updateQuotationWithAI(currentData: QuotationData, prompt: string, audioBase64?: string): Promise<QuotationData> {
  const ai = getAI();
  
  // Use pro model for complex reasoning and direct parsing from messy text
  const modelName = "gemini-3.1-pro-preview";

  const systemInstruction = `
    ROLE: You are the Lead Studio Manager for 'Filmify Weddings'. You excel at taking messy, informal, or conversational messages and turning them into professional structured wedding quotations.

    TASKS:
    1. EXTRACT CLIENT: Find the client name (e.g., 'Mittal' from 'Hi Mittal').
    2. RECONSTRUCT FUNCTIONS: Scan the entire message for dates (e.g., 25th Jan) and event types (e.g., Haldi).
       - Create a NEW array of functions based on the message. 
       - If the message says 'Haldi bride on 26th Jan', 'Sangeet on 26th Jan (Evening)', create TWO separate entries.
       - 'services' should include items like 'Traditional Photography', 'Candid', 'Drone', etc., mentioned under each event.
    3. DELIVERABLES: List every item mentioned under 'Deliverables' or 'Requirement' sections.
    4. PRICING: Extract the final quote amount. Format it as a number.
    5. TERMS: If the message mentions delivery times (e.g., '1 Year Access') or album types, update terms fields.
    
    IMPORTANT: 
    - You MUST overwrite the existing 'functions' and 'finalDeliverables' with the new ones mentioned in the message. 
    - Do NOT just append; the user wants the quotation to REFLECT the message exactly.
    - If a time is mentioned like '10:00 AM to 11 pm', capture it precisely.
    - RETURN ONLY THE JSON.
  `;

  const parts: any[] = [];
  if (audioBase64) {
    parts.push({ inlineData: { data: audioBase64, mimeType: "audio/webm" } });
    parts.push({ text: "AUDIO_INPUT: Listen to this instruction carefully and apply it to the quotation data." });
  }

  if (prompt) {
    parts.push({ text: `CONVERSATIONAL_TEXT_INPUT: "${prompt}"` });
  }

  parts.push({ text: `CURRENT_STATE_JSON: ${JSON.stringify(currentData)}` });
  parts.push({ text: "INSTRUCTION: Update the current state based on the input. Return the full new state matching the schema." });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: QUOTATION_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI fail.");
    
    const parsed = JSON.parse(text);
    
    // Safety check for IDs
    const sanitizedFunctions = (parsed.functions || []).map((f: any) => ({
      ...f,
      id: f.id || Math.random().toString(36).substr(2, 9)
    }));

    return {
      ...currentData,
      ...parsed,
      functions: sanitizedFunctions,
      id: currentData.id
    };
  } catch (error) {
    console.error("Advanced Parsing Failed:", error);
    throw error;
  }
}
