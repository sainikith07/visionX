
import { GoogleGenAI } from "@google/genai";

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
          { text: "Perform professional document restoration. Eliminate physical obstructions (fingers, glares, shadows), perform background whitening while preserving text legibility, and optimize contrast for OCR-ready quality. Output the restored document image only." }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Invalid Model Response");
  } catch (error) {
    console.error("Doc Enhancement Error:", error);
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
          { text: `System Command: Architectural Inpainting. The red strokes designate objects for deletion. You must intelligently reconstruct the background (floors, walls, shadows) to ensure structural continuity. ${instructions}` }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Staging Failed");
  } catch (error) {
    console.error("Staging Error:", error);
    throw error;
  }
};
