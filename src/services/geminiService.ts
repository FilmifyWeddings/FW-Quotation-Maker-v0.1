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
          time: { type: Type.STRING },
          services: { type: Type.ARRAY, items: { type: Type.STRING } }
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
  }
};

export async function updateQuotationWithAI(currentData: QuotationData, prompt: string, audioBase64?: string): Promise<QuotationData> {
  const ai = getAI();
  const systemInstruction = `
    You are a professional Wedding Photography Studio Manager. 
    Your task is to parse a user's request (which could be a message to a client or a set of notes) and extract structured quotation data.
    
    GUIDELINES:
    1. EXTRACT EVENTS: For every event mentioned (e.g., Haldi, Sangeet, Wedding), extract the Date, Name, Time Range, and Requirements (Requirements should be mapped to the 'services' array).
    2. DELIVERABLES: List all deliverables mentioned in 'finalDeliverables'.
    3. AMOUNT: If a final quote or total budget is mentioned, update 'finalAmount'.
    4. TERMS: If terms like 'Raw Data', 'Edited Photos', 'Album Policies' are mentioned, update the respective terms arrays.
    5. CONSISTENCY: Always return a VALID JSON object matching the full schema. Keep IDs unique if creating new events.
  `;

  const parts: any[] = [
    { text: `SYSTEM: ${systemInstruction}` },
    { text: `CURRENT_STATE: ${JSON.stringify(currentData, null, 2)}` }
  ];

  if (audioBase64) {
    parts.push({
      inlineData: { data: audioBase64, mimeType: "audio/webm" }
    });
  }

  if (prompt) {
    parts.push({ text: `USER_REQUEST: "${prompt}"` });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: QUOTATION_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI returned empty response");
    
    const parsed = JSON.parse(text);
    // Ensure ID and required fields are preserved from current state if AI omits them
    return {
      ...currentData,
      ...parsed,
      id: currentData.id // ID should be immutable
    };
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw error;
  }
}
