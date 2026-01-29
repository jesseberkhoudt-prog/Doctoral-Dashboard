'use client';

import { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import RichTextEditor from '../RichTextEditor';

export default function Methods() {
  const [content, setContent] = useState('');

  useEffect(() => {
    const sections = storage.get('sections') || {};
    const methods = sections.methods || { content: '' };
    setContent(methods.content);
  }, []);

  const handleSave = (newContent) => {
    const sections = storage.get('sections') || {};
    sections.methods = {
      ...sections.methods,
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Methods</h1>
          <p className="text-slate-600">Document your research methodology, design, and procedures.</p>
        </div>

        <RichTextEditor
          value={content}
          onChange={handleSave}
          placeholder="Describe your research design, data collection methods, analysis procedures, and ethical considerations..."
        />

        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">Key Components:</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Research Design (qualitative, quantitative, mixed methods)</li>
            <li>• Participants/Sample</li>
            <li>• Data Collection Instruments</li>
            <li>• Data Analysis Procedures</li>
            <li>• Validity and Reliability</li>
            <li>• Ethical Considerations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
