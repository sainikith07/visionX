import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client.
const getAIClient = () => {
  // Use the process.env.API_KEY directly as specified in the guidelines.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Enhances document images using Gemini image-to-image capabilities.
 * Switched model to 'gemini-2.5-flash-image' for image editing tasks.
 */
export const enhanceDocument = async (base64Image: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: "Enhance this document image for professional archival. Remove shadows, glares, and artifacts. Whiten the background and sharpen the text significantly. Output only the image data." }
        ]
      }
    });

    // Iterate through candidates and parts to safely extract image data.
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("AI enhancement failed: No image returned.");
    
    return `data:image/png;base64,${part.inlineData.data}`;
  } catch (error) {
    console.error("Document enhancement error:", error);
    throw error;
  }
};

/**
 * Stages a room by removing marked objects and reconstructing the scene.
 */
export const stageRoom = async (base64Image: string, instructions: string = ""): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: instructions || "Remove the objects marked in the image and reconstruct the background textures naturally." }
        ]
      }
    });

    // Find the image part in the response as per best practices.
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Staging failed: No image returned.");

    return `data:image/png;base64,${part.inlineData.data}`;
  } catch (error) {
    console.error("Room staging error:", error);
    throw error;
  }
};
