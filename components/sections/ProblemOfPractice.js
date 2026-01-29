'use client';

import { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import RichTextEditor from '../RichTextEditor';

export default function ProblemOfPractice() {
  const [content, setContent] = useState('');
  const [lastEdited, setLastEdited] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const sections = storage.get('sections') || {};
    const pop = sections.pop || { content: '', lastEdited: null };
    setContent(pop.content);
    setLastEdited(pop.lastEdited);
  };

  const handleSave = (newContent) => {
    const sections = storage.get('sections') || {};
    sections.pop = {
      ...sections.pop,
      content: newContent,
      lastEdited: new Date().toISOString()
    };
    storage.set('sections', sections);
    setContent(newContent);
    setLastEdited(sections.pop.lastEdited);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Problem of Practice</h1>
          <p className="text-slate-600">Define and articulate the core problem your research addresses.</p>
          {lastEdited && (
            <p className="text-sm text-slate-500 mt-2">
              Last edited: {new Date(lastEdited).toLocaleString()}
            </p>
          )}
        </div>

        <div className="prose max-w-none">
          <RichTextEditor
            value={content}
            onChange={handleSave}
            placeholder="Describe your Problem of Practice here. What is the issue you're investigating? Why is it important? Who is affected?"
          />
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Guiding Questions:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• What is the specific problem or challenge in your context?</li>
            <li>• Why is this problem significant and worth investigating?</li>
            <li>• Who are the stakeholders affected by this problem?</li>
            <li>• What evidence suggests this is a problem?</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
