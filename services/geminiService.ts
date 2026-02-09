
import { GoogleGenAI } from "@google/genai";

// Initialize AI client using the API key from environment variables
const getAIClient = () => {
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
          { text: `The provided image has red markings. These markings indicate SEVERAL specific objects that must be removed. Completely erase EVERY object covered by red and inpaint the area with the matching background (floor, wall, etc.). Ensure all red-marked regions are seamlessly filled. ${instructions}` }
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
