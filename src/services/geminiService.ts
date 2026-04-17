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
  
  // Using Flash-3 which is highly available and fast for real-time app use
  const modelName = "gemini-3-flash-preview";

  const systemInstruction = `
    ROLE: Lead Event Manager for Filmify Pro.
    GOAL: Rebuild the structured quotation JSON based on the user's latest messy message or voice note.
    
    PARSING RULES:
    1. CLIENT: Identify the name from the greeting (e.g., 'Hi Mittal' -> clientName: 'Mittal').
    2. EVENTS: Scan for specific dates (25th Jan, 26th Jan, etc.) and event names. For each unique event:
       - Extract 'date', 'name', and 'time'.
       - Under 'services', add the requirements found under that specific date (Photography, Videography, Drone, etc.).
    3. PRICE: Extract the total amount mentioned (e.g., ₹1,45,000 -> 145000).
    4. DELIVERABLES: List every single deliverable mentioned (Alum, raw data, best edited photos, cinematic video, calendar, etc.) into the 'finalDeliverables' array.
    5. DATA INTEGRITY: Return the FULL JSON. Ensure all fields in the schema are present.
    
    IMPORTANT: The user wants their message to REFLECT in the editor immediately. Overwrite existing functions/deliverables if the new request describes a complete list.
  `;

  const parts: any[] = [];
  if (audioBase64) {
    parts.push({ 
      inlineData: { data: audioBase64, mimeType: "audio/webm" } 
    });
    parts.push({ text: "AUDIO_INPUT: Listen and extract the entire quotation structure from this voice note." });
  }

  if (prompt) {
    parts.push({ text: `TEXT_INPUT: "${prompt}"` });
  }

  parts.push({ text: `CURRENT_STATE: ${JSON.stringify(currentData)}` });
  parts.push({ text: "PROCESS: Analyze the text input and return the updated Quotation JSON. Overwrite lists if the input describes a full set of events/deliverables." });

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
    if (!text) throw new Error("AI returned empty result");
    
    const parsed = JSON.parse(text);
    
    // Auto-generate IDs for new items
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
    console.error("Gemini Critical Error:", error);
    throw error;
  }
}
