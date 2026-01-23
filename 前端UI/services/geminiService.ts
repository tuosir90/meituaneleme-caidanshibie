
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ExtractionResult } from "../types";

export const extractMenuFromImages = async (base64Images: string[]): Promise<ExtractionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const imageParts = base64Images.map(base64 => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: base64.split(',')[1]
    }
  }));

  const prompt = `
    请从提供的餐厅菜单图片中提取所有菜品名称及其价格。
    返回结构化的项目列表。
    确保名称与菜单中显示的完全一致。
    价格应提取为数字。如果给出的是价格范围，请使用最低价格。
    如果菜单有多个部分，请提取全部内容。
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          ...imageParts,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "菜品或饮品的完整名称" },
                  originalPrice: { type: Type.NUMBER, description: "该项目的标价" }
                },
                required: ["name", "originalPrice"]
              }
            }
          },
          required: ["items"]
        }
      }
    });

    const jsonStr = response.text || '{"items": []}';
    const result = JSON.parse(jsonStr.trim());
    
    return {
      items: (result.items || []).map((item: any, index: number) => ({
        ...item,
        id: `item-${Date.now()}-${index}`
      }))
    };
  } catch (error) {
    console.error("Gemini 提取错误:", error);
    throw new Error("无法提取菜单数据。请尝试使用更清晰的图片重新上传。");
  }
};
