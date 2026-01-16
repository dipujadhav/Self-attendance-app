
import { GoogleGenAI } from "@google/genai";

// Helper to check/request API key
export const ensureApiKey = async (): Promise<boolean> => {
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
      // Fix: As per guidelines, assume success after triggering openSelectKey to avoid race conditions.
      return true;
    }
    return true;
  }
  return false;
};

// --- Nano Banana Pro (Image Gen) ---
export const generateProImage = async (
  prompt: string,
  size: '1K' | '2K' | '4K'
): Promise<string> => {
  // Fix: Create instance right before call as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Using gemini-3-pro-image-preview for high quality images
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: '1:1', // Defaulting to square for simplicity, could be an option
      },
    },
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated");
};

// --- Veo (Video Gen) ---
export const generateVeoVideo = async (
  imageBase64: string,
  prompt: string,
  aspectRatio: '16:9' | '9:16'
): Promise<string> => {
  // Fix: Create instance right before call as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Clean base64 string
  const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || "Animate this image naturally.",
    image: {
        imageBytes: cleanBase64,
        mimeType: 'image/png' // Assuming png/jpeg input, typical for uploads
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  // Polling loop
  while (!operation.done) {
    // Fix: Poll every 10s as per guideline recommendation for better operation status checking.
    await new Promise(resolve => setTimeout(resolve, 10000)); 
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed or returned no URI.");

  // Fetch the actual video bytes using the API key
  const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!res.ok) throw new Error("Failed to download generated video.");
  
  const blob = await res.blob();
  return URL.createObjectURL(blob);
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};
