'use client';

import { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { FiPlus, FiTrash2, FiMessageSquare } from 'react-icons/fi';

export default function Meetings() {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const sections = storage.get('sections') || {};
    const meetings = sections.meetings || { entries: [] };
    setEntries(meetings.entries || []);
  };

  const saveData = (newEntries) => {
    const sections = storage.get('sections') || {};
    sections.meetings = {
      ...sections.meetings,
      entries: newEntries,
      lastEdited: new Date().toISOString()
    };
    storage.set('sections', sections);
  };

  const addEntry = () => {
    const title = prompt('Meeting/Note title:');
    if (title) {
      const date = prompt('Date (YYYY-MM-DD):') || new Date().toISOString().split('T')[0];
      const newEntry = {
        id: Date.now(),
        title,
        date,
        notes: '',
        created: new Date().toISOString()
      };
      const newEntries = [newEntry, ...entries];
      setEntries(newEntries);
      setSelectedEntry(newEntry.id);
      saveData(newEntries);
    }
  };

  const deleteEntry = (id) => {
    if (confirm('Delete this entry?')) {
      const newEntries = entries.filter(e => e.id !== id);
      setEntries(newEntries);
      if (selectedEntry === id) setSelectedEntry(null);
      saveData(newEntries);
    }
  };

  const updateNotes = (id, notes) => {
    const newEntries = entries.map(e => {
      if (e.id === id) {
        return { ...e, notes };
      }
      return e;
    });
    setEntries(newEntries);
    saveData(newEntries);
  };

  const currentEntry = entries.find(e => e.id === selectedEntry);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Meetings & Notes</h1>
          <p className="text-slate-600">Record meeting notes and important conversations.</p>
        </div>

        <div className="flex" style={{ height: 'calc(100vh - 250px)' }}>
          {/* Entry List */}
          <div className="w-80 border-r border-slate-200 overflow-y-auto bg-slate-50">
            <div className="p-4">
              <button
                onClick={addEntry}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <FiPlus /> New Entry
              </button>
            </div>

            <div className="space-y-1 px-2">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className={`group flex items-start justify-between p-3 rounded-lg cursor-pointer transition ${
                    selectedEntry === entry.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                  onClick={() => setSelectedEntry(entry.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{entry.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{entry.date}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEntry(entry.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded ml-2"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Editor */}
          <div className="flex-1 overflow-y-auto">
            {currentEntry ? (
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-slate-800">{currentEntry.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{currentEntry.date}</p>
                </div>

                <textarea
                  value={currentEntry.notes}
                  onChange={(e) => updateNotes(currentEntry.id, e.target.value)}
                  className="w-full h-96 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                  placeholder="Enter your meeting notes here..."
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <FiMessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p>No entry selected. Create a new entry to start taking notes.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
