import { GoogleGenAI, Type } from "@google/genai";
import { QuotationData } from "../types";

const getApiKey = () => localStorage.getItem('GEMINI_API_KEY') || process.env.GEMINI_API_KEY || "";

const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

const QUOTATION_SCHEMA: any = {
  type: Type.OBJECT,
  properties: {
    clientName: { type: Type.STRING },
    finalAmount: { type: Type.NUMBER },
    preWeddingDeliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
    functions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
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
          date: { type: Type.STRING },
          step: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          status: { type: Type.STRING }
        }
      }
    }
  }
};

export async function updateQuotationWithAI(currentData: QuotationData, prompt: string, audioBase64?: string): Promise<Partial<QuotationData>> {
  const ai = getAI();
  const parts: any[] = [
    { text: `Current Quotation JSON: ${JSON.stringify(currentData, null, 2)}` }
  ];

  if (audioBase64) {
    parts.push({
      inlineData: {
        data: audioBase64,
        mimeType: "audio/webm"
      }
    });
    parts.push({ text: "The user has provided an audio request. Transcribe it (Hindi/English mix) and then apply the requested changes to the JSON." });
  }

  if (prompt) {
    parts.push({ text: `User request text: "${prompt}"` });
  }

  parts.push({ text: "Apply the changes and return ONLY the updated JSON fields according to the schema. Ensure the total amount and payment steps remain consistent." });

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
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini AI update failed:", error);
    throw error;
  }
}
