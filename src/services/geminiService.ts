import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askGemini(question: string, context?: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction: `You are the SaIT Navigator AI Assistant. 
        You help students and visitors find their way around the campus. 
        Context: ${context || 'General campus information.'}
        Keep your answers concise and helpful.`,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again.";
  }
}
