import { QuotationData } from "../types";

const APPS_SCRIPT_URL = (import.meta as any).env.VITE_GOOGLE_SHEETS_API_URL || "";

export async function fetchAllQuotations(): Promise<QuotationData[]> {
  if (!APPS_SCRIPT_URL) return [];
  
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=list`);
    if (!response.ok) throw new Error("Failed to fetch quotations");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch failed:", error);
    return [];
  }
}

export async function saveQuotation(data: QuotationData): Promise<boolean> {
  if (!APPS_SCRIPT_URL) {
    console.warn("No Google Sheets API URL provided. Saving locally only.");
    return false;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Standard for simple Apps Script web app requests
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "save",
        data: {
          ...data,
          lastModified: new Date().toISOString()
        }
      }),
    });
    return true; // no-cors doesn't give us response body, but usually works
  } catch (error) {
    console.error("Save failed:", error);
    return false;
  }
}

export async function deleteQuotationFromCloud(id: string): Promise<boolean> {
  if (!APPS_SCRIPT_URL) return false;

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({ action: "delete", id }),
    });
    return true;
  } catch (error) {
    console.error("Delete failed:", error);
    return false;
  }
}
