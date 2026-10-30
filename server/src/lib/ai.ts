import { GoogleGenAI, type Part, type Schema } from "@google/genai";
import mammoth from "mammoth";

const ai = new GoogleGenAI();

export interface GenerateWithAttachmentParams {
  prompt: string;
  buffer: Buffer;
  mimeType: string;
  filename?: string;
  systemPrompt?: string;
  responseSchema?: Schema; // 👈 Add response schema type
}

export async function generateWithAttachment({
  prompt,
  buffer,
  mimeType,
  filename = "",
  systemPrompt,
  responseSchema,
}: GenerateWithAttachmentParams): Promise<string | null> {
  try {
    const contents: Array<string | Part> = [];

    // 1. DOCX Handling
    const isDocx =
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      filename.toLowerCase().endsWith(".docx");

    if (isDocx) {
      const { value: extractedText } = await mammoth.extractRawText({ buffer });
      contents.push(
        `--- ATTACHED DOCX CONTENT ---\n${extractedText}\n--- END OF ATTACHMENT ---`,
      );
    }
    // 2. Text / CSV / Markdown Handling
    else if (
      mimeType.startsWith("text/") ||
      filename.toLowerCase().endsWith(".txt") ||
      filename.toLowerCase().endsWith(".md") ||
      filename.toLowerCase().endsWith(".csv")
    ) {
      const textContent = buffer.toString("utf-8");
      contents.push(
        `--- ATTACHED TEXT CONTENT ---\n${textContent}\n--- END OF ATTACHMENT ---`,
      );
    }
    // 3. Native Multimodal (PDF, PNG, JPG, WebP)
    else {
      contents.push({
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: mimeType,
        },
      });
    }

    contents.push(prompt);

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
        ...(responseSchema
          ? {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
            }
          : {}),
      },
    });

    return response.text ?? null;
  } catch (error) {
    console.error("Error generating content with attachment:", error);
    throw error;
  }
}
