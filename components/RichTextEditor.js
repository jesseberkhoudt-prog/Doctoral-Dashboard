'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function RichTextEditor({ value, onChange, placeholder = 'Start writing...', autoSave = true }) {
  const [content, setContent] = useState(value || '');
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    setContent(value || '');
  }, [value]);

  const handleChange = (newContent) => {
    setContent(newContent);

    if (autoSave) {
      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for auto-save (1 second delay)
      saveTimeoutRef.current = setTimeout(() => {
        onChange(newContent);
        setLastSaved(new Date());
      }, 1000);
    } else {
      onChange(newContent);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['blockquote', 'code-block'],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'blockquote', 'code-block',
    'color', 'background',
    'align',
    'link',
  ];

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={content}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white rounded-lg border border-slate-300"
      />
      {autoSave && lastSaved && (
        <div className="text-xs text-slate-500 mt-2">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
