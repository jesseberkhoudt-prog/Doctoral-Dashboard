"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function RichEditor({
  value,
  onChange
}: {
  value: any;
  onChange: (json: any) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: { class: "tiptap" }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    }
  });

  return <EditorContent editor={editor} />;
}
