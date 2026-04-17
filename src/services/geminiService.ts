import { GoogleGenAI } from "@google/genai";
import { QuotationData } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const QUOTATION_SCHEMA: any = {
  type: "OBJECT",
  properties: {
    clientName: { type: "STRING" },
    finalAmount: { type: "NUMBER" },
    preWeddingDeliverables: { type: "ARRAY", items: { type: "STRING" } },
    functions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          date: { type: "STRING" },
          name: { type: "STRING" },
          time: { type: "STRING" },
          services: { type: "ARRAY", items: { type: "STRING" } }
        }
      }
    },
    finalDeliverables: { type: "ARRAY", items: { type: "STRING" } },
    paymentSchedule: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          date: { type: "STRING" },
          step: { type: "STRING" },
          amount: { type: "NUMBER" },
          status: { type: "STRING", enum: ["Pending", "Completed"] }
        }
      }
    }
  }
};

export async function updateQuotationWithAI(currentData: QuotationData, prompt: string): Promise<Partial<QuotationData>> {
  const model = (genAI as any).getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const fullPrompt = `
    You are an expert wedding photography quotation assistant. 
    Take the current quotation data and update it based on the user's natural language request.
    
    Current Data:
    ${JSON.stringify(currentData, null, 2)}
    
    User Request: "${prompt}"
    
    Apply the changes and return ONLY the updated JSON fields. Do not modify fields not mentioned if possible, but ensure logical consistency (e.g., if total amount changes, you may need to adjust payment steps if requested).
  `;

  try {
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini AI update failed:", error);
    throw error;
  }
}
