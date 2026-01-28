
import { GoogleGenAI } from "@google/genai";

// Initialize AI client using the API key from environment variables
const getAIClient = () => {
  // Use the process.env.API_KEY string directly as per guidelines
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const enhanceDocument = async (base64Image: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: "Enhance this scanned document. Remove shadows, human fingers, background noise, and improve contrast to make it perfectly readable like a professional scan." }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image part returned from Gemini");
  } catch (error) {
    console.error("Gemini Document Enhancement Error:", error);
    throw error;
  }
};

export const stageRoom = async (base64Image: string, instructions: string = ""): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: `Act as a professional interior stager. Remove all existing furniture, clutter, and distracting objects from this room to visualize a clean, empty, or minimally staged professional space. ${instructions}` }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image part returned from Gemini");
  } catch (error) {
    console.error("Gemini Staging Error:", error);
    throw error;
  }
};
