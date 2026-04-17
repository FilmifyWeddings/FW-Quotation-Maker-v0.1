export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const apiKey = (import.meta as any).env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API Key not found. Please add OPENAI_API_KEY to your secrets.");
  }

  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("model", "whisper-1");
  formData.append("language", "hi"); // Optimizing for Hindi/English mix

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Transcription failed");
  }

  const result = await response.json();
  return result.text;
}
