'use client';

import { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import RichTextEditor from '../RichTextEditor';

export default function ConceptualFramework() {
  const [content, setContent] = useState('');

  useEffect(() => {
    const sections = storage.get('sections') || {};
    const framework = sections.conceptualFramework || { content: '' };
    setContent(framework.content);
  }, []);

  const handleSave = (newContent) => {
    const sections = storage.get('sections') || {};
    sections.conceptualFramework = {
      ...sections.conceptualFramework,
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Conceptual Framework / Logic Model</h1>
          <p className="text-slate-600">Define the theoretical foundation and logic model for your research.</p>
        </div>

        <RichTextEditor
          value={content}
          onChange={handleSave}
          placeholder="Describe your conceptual framework, theoretical foundations, and logic model..."
        />
      </div>
    </div>
  );
}
