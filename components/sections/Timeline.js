'use client';

import { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { FiPlus, FiTrash2, FiCalendar } from 'react-icons/fi';

export default function Timeline() {
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const sections = storage.get('sections') || {};
    const timeline = sections.timeline || { milestones: [] };
    setMilestones(timeline.milestones || []);
  };

  const saveData = (newMilestones) => {
    const sections = storage.get('sections') || {};
    sections.timeline = {
      ...sections.timeline,
      milestones: newMilestones,
      lastEdited: new Date().toISOString()
    };
    storage.set('sections', sections);
  };

  const addMilestone = () => {
    const title = prompt('Milestone title:');
    if (title) {
      const date = prompt('Target date (YYYY-MM-DD):');
      const newMilestone = {
        id: Date.now(),
        title,
        date: date || '',
        status: 'pending',
        notes: ''
      };
      const newMilestones = [...milestones, newMilestone].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      setMilestones(newMilestones);
      saveData(newMilestones);
    }
  };

  const toggleStatus = (id) => {
    const newMilestones = milestones.map(m => {
      if (m.id === id) {
        const statuses = ['pending', 'in-progress', 'completed'];
        const currentIndex = statuses.indexOf(m.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        return { ...m, status: nextStatus };
      }
      return m;
    });
    setMilestones(newMilestones);
    saveData(newMilestones);
  };

  const deleteMilestone = (id) => {
    if (confirm('Delete this milestone?')) {
      const newMilestones = milestones.filter(m => m.id !== id);
      setMilestones(newMilestones);
      saveData(newMilestones);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Timeline & Milestones</h1>
          <p className="text-slate-600">Plan and track your research timeline.</p>
        </div>

        <button
          onClick={addMilestone}
          className="mb-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <FiPlus /> Add Milestone
        </button>

        {milestones.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FiCalendar className="w-12 h-12 mx-auto mb-2 text-slate-400" />
            <p>No milestones yet. Add your first milestone.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`border-2 rounded-lg p-4 ${getStatusColor(milestone.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => toggleStatus(milestone.id)}
                        className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center hover:bg-white/50"
                      >
                        {milestone.status === 'completed' && '✓'}
                      </button>
                      <h3 className="font-semibold text-lg">{milestone.title}</h3>
                    </div>
                    <div className="ml-9 space-y-1">
                      <p className="text-sm">
                        <strong>Date:</strong> {milestone.date || 'Not set'}
                      </p>
                      <p className="text-sm">
                        <strong>Status:</strong> {milestone.status.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
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
    </div>
  );
}
