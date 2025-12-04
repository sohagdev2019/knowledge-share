/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Menubar } from "./Menubar";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useRef } from "react";

export function RichTextEditor({ field }: { field: any }) {
  const isUpdatingFromExternal = useRef(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    editorProps: {
      attributes: {
        class:
          "min-h-[300px] p-4 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert !w-full !max-w-none",
      },
    },

    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      // Only update form if the change is from user interaction, not from external update
      if (!isUpdatingFromExternal.current) {
        field.onChange(JSON.stringify(editor.getJSON()));
      }
    },

    content: field.value ? (() => {
      try {
        return typeof field.value === 'string' ? JSON.parse(field.value) : field.value;
      } catch {
        return "<p>Hello World 🚀</p>";
      }
    })() : "<p>Hello World 🚀</p>",
  });

  // Update editor content when field value changes externally (e.g., from AI generation)
  useEffect(() => {
    if (!editor) return;
    
    if (field.value) {
      try {
        const parsedContent = typeof field.value === 'string' ? JSON.parse(field.value) : field.value;
        const currentContent = editor.getJSON();
        const currentContentStr = JSON.stringify(currentContent);
        const newContentStr = JSON.stringify(parsedContent);
        
        // Only update if content is different to avoid unnecessary updates and loops
        if (currentContentStr !== newContentStr) {
          isUpdatingFromExternal.current = true;
          editor.commands.setContent(parsedContent);
          // Reset flag after a brief delay to allow the update to complete
          setTimeout(() => {
            isUpdatingFromExternal.current = false;
          }, 100);
        }
      } catch (error) {
        console.error("Error updating editor content:", error);
        // If parsing fails, try to set as plain text
        if (typeof field.value === 'string') {
          isUpdatingFromExternal.current = true;
          editor.commands.setContent(`<p>${field.value}</p>`);
          setTimeout(() => {
            isUpdatingFromExternal.current = false;
          }, 100);
        }
      }
    }
  }, [field.value, editor]);

  return (
    <div className="w-full border border-input rounded-lg overflow-hidden dark:bg-input/30">
      <Menubar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
