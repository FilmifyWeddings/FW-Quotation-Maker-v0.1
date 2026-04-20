import { GoogleGenAI, Type } from "@google/genai";
import { QuotationData } from "../types";

const getApiKey = () => localStorage.getItem('GEMINI_API_KEY') || process.env.GEMINI_API_KEY || "";
const getGroqKey = () => localStorage.getItem('GROQ_API_KEY') || "";

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

export async function transcribeWithGroq(audioBlob: Blob): Promise<string> {
  const apiKey = getGroqKey();
  if (!apiKey) throw new Error("Groq API Key missing. Please set it in Settings for perfect voice.");

  const formData = new FormData();
  // Using a more standard filename to help the API identify the container
  formData.append("file", audioBlob, "recording.m4a");
  formData.append("model", "whisper-large-v3");
  // Removed fixed language to allow auto-detection of Hindi/English mix for better accuracy

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Transcription failed");
  }

  const result = await response.json();
  return result.text;
}

export async function updateQuotationWithAI(currentData: QuotationData, prompt: string, audioBase64?: string): Promise<QuotationData> {
  const ai = getAI();
  
  // Use 3.1 Pro for the highest level of reasoning and 'Speech Repair'
  const modelName = "gemini-3.1-pro-preview";

  const systemInstruction = `
    ROLE: You are the 'Lead Studio Manager' for 'Filmify Weddings'. 
    EXPERTISE: You are an expert at repairing messy, broken, or garbled voice transcriptions and turning them into professional Wedding Quotations.
    
    TASKS:
    1. SPEECH REPAIR: The input might contain voice-to-text errors (e.g., 'Haldi' might be heard as 'Healthy'). use your knowledge of Indian weddings to repair these typos.
    2. ENTITY EXTRACTION:
       - Client Name: e.g., 'Hi Mittal' -> 'Mittal'.
       - Functions: Extract every event, date, and time. Overwrite existing ones if the new request covers the full flow.
       - Services: Map requirements like 'Traditional Photo', 'Drone', 'Candid' to each specific event.
       - Amount: Extract the final quote number accurately.
    3. DATA COMPLETENESS: Return the FULL valid JSON.
    
    IMPORTANT: 
    - If the user provides a detailed list, it means they want to RE-SYNC the quotation to that list. 
    - Be smart about dates. If they say '25th Jan' and later 'next day', use logic to determine the date.
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
