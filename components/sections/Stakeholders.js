'use client';

import { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import RichTextEditor from '../RichTextEditor';

export default function Stakeholders() {
  const [content, setContent] = useState('');

  useEffect(() => {
    const sections = storage.get('sections') || {};
    const stakeholders = sections.stakeholders || { content: '' };
    setContent(stakeholders.content);
  }, []);

  const handleSave = (newContent) => {
    const sections = storage.get('sections') || {};
    sections.stakeholders = {
      ...sections.stakeholders,
      content: newContent,
      lastEdited: new Date().toISOString()
    };
    storage.set('sections', sections);
    setContent(newContent);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Stakeholders</h1>
          <p className="text-slate-600">Identify and analyze key stakeholders in your research.</p>
        </div>

        <RichTextEditor
          value={content}
          onChange={handleSave}
          placeholder="Identify stakeholders, their interests, influence, and how they relate to your research..."
        />
      </div>
    </div>
  );
}
