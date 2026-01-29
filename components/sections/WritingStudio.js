'use client';

import { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import RichTextEditor from '../RichTextEditor';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

export default function WritingStudio() {
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const sections = storage.get('sections') || {};
    const writing = sections.writing || { chapters: [] };
    const chaps = writing.chapters || [];
    setChapters(chaps);
    if (chaps.length > 0 && !selectedChapter) {
      setSelectedChapter(chaps[0].id);
    }
  };

  const saveData = (newChapters) => {
    const sections = storage.get('sections') || {};
    sections.writing = {
      ...sections.writing,
      chapters: newChapters,
      lastEdited: new Date().toISOString()
    };
    storage.set('sections', sections);
  };

  const addChapter = () => {
    const title = prompt('Enter chapter title:');
    if (title) {
      const target = prompt('Word count target:') || '0';
      const newChapter = {
        id: Date.now(),
        title,
        content: '',
        wordCountTarget: parseInt(target),
        versions: []
      };
      const newChapters = [...chapters, newChapter];
      setChapters(newChapters);
      setSelectedChapter(newChapter.id);
      saveData(newChapters);
    }
  };

  const deleteChapter = (id) => {
    if (confirm('Delete this chapter?')) {
      const newChapters = chapters.filter(c => c.id !== id);
      setChapters(newChapters);
      if (selectedChapter === id && newChapters.length > 0) {
        setSelectedChapter(newChapters[0].id);
      }
      saveData(newChapters);
    }
  };

  const updateChapterContent = (id, content) => {
    const newChapters = chapters.map(c => {
      if (c.id === id) {
        return { ...c, content };
      }
      return c;
    });
    setChapters(newChapters);
    saveData(newChapters);
  };

  const currentChapter = chapters.find(c => c.id === selectedChapter);
  const wordCount = currentChapter ? currentChapter.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Writing Studio</h1>
          <p className="text-slate-600">Draft and organize your dissertation chapters.</p>
        </div>

        <div className="flex" style={{ height: 'calc(100vh - 250px)' }}>
          {/* Chapter List */}
          <div className="w-64 border-r border-slate-200 overflow-y-auto bg-slate-50">
            <div className="p-4">
              <button
                onClick={addChapter}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <FiPlus /> New Chapter
              </button>
            </div>

            <div className="space-y-1 px-2">
              {chapters.map(chapter => (
                <div
                  key={chapter.id}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                    selectedChapter === chapter.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  onClick={() => setSelectedChapter(chapter.id)}
                >
                  <span className="text-sm font-medium truncate">{chapter.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChapter(chapter.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-y-auto">
            {currentChapter ? (
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800">{currentChapter.title}</h2>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">{wordCount}</span> / {currentChapter.wordCountTarget} words
                    <div className="w-48 h-2 bg-slate-200 rounded-full mt-1">
                      <div
                        className="h-2 bg-green-600 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (wordCount / currentChapter.wordCountTarget) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <RichTextEditor
                  value={currentChapter.content}
                  onChange={(content) => updateChapterContent(currentChapter.id, content)}
                  placeholder="Start writing your chapter..."
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <FiEdit2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p>No chapter selected. Create a new chapter to start writing.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
