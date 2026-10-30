import { GoogleGenAI, type Part } from "@google/genai";
import mammoth from "mammoth";

const ai = new GoogleGenAI(); // Reads GEMINI_API_KEY from process.env

export interface GenerateWithAttachmentParams {
  prompt: string;
  buffer: Buffer;
  mimeType: string;
  filename?: string;
}

/**
 * Universal attachment processor for Gemini with TypeScript typing
 */
export async function generateWithAttachment({
  prompt,
  buffer,
  mimeType,
  filename = "",
}: GenerateWithAttachmentParams): Promise<string | null> {
  try {
    // Array accepts string prompts and Part objects (like inlineData)
    const contents: Array<string | Part> = [];

    // 1. Handle DOCX files -> Extract plain text first
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
    // 2. Handle Plain Text files (.txt, .md, .csv)
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
    // 3. Handle Native Multimodal files (PDF & Images)
    else {
      contents.push({
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: mimeType,
        },
      });
    }

    // Append the user's prompt
    contents.push(prompt);

    // Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    return response.text ?? null;
  } catch (error) {
    console.error("Error generating content with attachment:", error);
    throw error;
  }
}
