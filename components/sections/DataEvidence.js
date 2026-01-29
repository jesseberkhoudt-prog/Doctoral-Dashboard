'use client';

import { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { FiUpload, FiFile, FiTag, FiTrash2 } from 'react-icons/fi';

export default function DataEvidence() {
  const [items, setItems] = useState([]);
  const [codes, setCodes] = useState([]);
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const sections = storage.get('sections') || {};
    const data = sections.data || { items: [], codes: [], themes: [] };
    setItems(data.items || []);
    setCodes(data.codes || []);
    setThemes(data.themes || []);
  };

  const saveData = (newItems, newCodes = codes, newThemes = themes) => {
    const sections = storage.get('sections') || {};
    sections.data = {
      ...sections.data,
      items: newItems,
      codes: newCodes,
      themes: newThemes,
      lastEdited: new Date().toISOString()
    };
    storage.set('sections', sections);
  };

  const addItem = () => {
    const name = prompt('Enter file/evidence name:');
    if (name) {
      const type = prompt('Type (PDF, CSV, Interview, Observation, etc.):') || 'Document';
      const newItems = [...items, {
        id: Date.now(),
        name,
        type,
        tags: [],
        notes: '',
        uploadDate: new Date().toISOString()
      }];
      setItems(newItems);
      saveData(newItems);
    }
  };

  const deleteItem = (id) => {
    if (confirm('Delete this item?')) {
      const newItems = items.filter(i => i.id !== id);
      setItems(newItems);
      saveData(newItems);
    }
  };

  const addCode = () => {
    const code = prompt('Enter code name:');
    if (code) {
      const newCodes = [...codes, { id: Date.now(), name: code, excerpts: [] }];
      setCodes(newCodes);
      saveData(items, newCodes);
    }
  };

  const addTheme = () => {
    const theme = prompt('Enter theme name:');
    if (theme) {
      const newThemes = [...themes, { id: Date.now(), name: theme, description: '' }];
      setThemes(newThemes);
      saveData(items, codes, newThemes);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Data & Evidence</h1>
          <p className="text-slate-600">Manage your research data, evidence, and qualitative coding.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evidence Items */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Evidence Items</h2>
              <button
                onClick={addItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <FiUpload /> Add Item
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-300 rounded-lg">
                <FiFile className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p>No evidence items yet. Add your first item.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FiFile className="text-blue-600" />
                          <h3 className="font-semibold text-slate-800">{item.name}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          Added: {new Date(item.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coding Panel */}
          <div className="space-y-6">
            {/* Codes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">Codes</h3>
                <button
                  onClick={addCode}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                >
                  + Code
                </button>
              </div>
              <div className="space-y-2">
                {codes.map(code => (
                  <div key={code.id} className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                    <FiTag className="text-purple-600" />
                    <span className="text-sm text-slate-700">{code.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">Themes</h3>
                <button
                  onClick={addTheme}
                  className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                >
                  + Theme
                </button>
              </div>
              <div className="space-y-2">
                {themes.map(theme => (
                  <div key={theme.id} className="p-2 bg-orange-50 rounded">
                    <div className="font-medium text-sm text-slate-800">{theme.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
