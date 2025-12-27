import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";

/**
 * Converts TipTap JSON content to HTML string
 */
export function tiptapJsonToHtml(json: string | object): string {
  try {
    const content = typeof json === 'string' ? JSON.parse(json) : json;
    return generateHTML(content, [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ]);
  } catch (error) {
    // If it's already HTML or invalid, return as-is
    if (typeof json === 'string' && !json.startsWith('{')) {
      return json;
    }
    console.error("Error converting TipTap JSON to HTML:", error);
    return "";
  }
}

/**
 * Checks if a string is TipTap JSON format
 */
export function isTipTapJson(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null && 'type' in parsed;
  } catch {
    return false;
  }
}











