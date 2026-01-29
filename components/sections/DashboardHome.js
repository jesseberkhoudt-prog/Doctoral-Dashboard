'use client';

import { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { FiTrendingUp, FiClock, FiActivity } from 'react-icons/fi';

export default function DashboardHome() {
  const [dashboard, setDashboard] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = storage.get('dashboard') || {
      progress: {
        pop: 0,
        literatureReview: 0,
        methods: 0,
        dataCollection: 0,
        analysis: 0,
        writing: 0
      },
      nextActions: [
        'Define your Problem of Practice',
        'Set up Literature Review buckets',
        'Create initial timeline'
      ]
    };
    setDashboard(data);

    const activityLog = storage.get('activity_log') || [];
    setActivity(activityLog.slice(0, 10));
  };

  const updateProgress = (key, value) => {
    const data = { ...dashboard };
    data.progress[key] = Math.min(100, Math.max(0, value));
    storage.set('dashboard', data);
    setDashboard(data);
  };

  const addNextAction = () => {
    const action = prompt('Enter next action:');
    if (action) {
      const data = { ...dashboard };
      data.nextActions.push(action);
      storage.set('dashboard', data);
      setDashboard(data);
    }
  };

  const removeNextAction = (index) => {
    const data = { ...dashboard };
    data.nextActions.splice(index, 1);
    storage.set('dashboard', data);
    setDashboard(data);
  };

  if (!dashboard) return <div>Loading...</div>;

  const progressItems = [
    { key: 'pop', label: 'Problem of Practice', color: 'blue' },
    { key: 'literatureReview', label: 'Literature Review', color: 'green' },
    { key: 'methods', label: 'Methods', color: 'purple' },
    { key: 'dataCollection', label: 'Data Collection', color: 'orange' },
    { key: 'analysis', label: 'Analysis', color: 'red' },
    { key: 'writing', label: 'Writing', color: 'indigo' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to Your Doctoral Dashboard</h1>
        <p className="text-slate-600">Track your progress, manage tasks, and navigate your research journey.</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <FiTrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-800">Research Progress</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {progressItems.map((item) => (
            <div key={item.key} className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className="text-sm font-bold text-slate-900">{dashboard.progress[item.key]}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div
                  className={`bg-${item.color}-600 h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${dashboard.progress[item.key]}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dashboard.progress[item.key]}
                onChange={(e) => updateProgress(item.key, parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiClock className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-slate-800">Next Actions</h2>
            </div>
            <button
              onClick={addNextAction}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
            >
              + Add
            </button>
          </div>
          
          <ul className="space-y-2">
            {dashboard.nextActions.length === 0 ? (
              <li className="text-slate-500 text-sm italic">No actions yet. Add your first task!</li>
            ) : (
              dashboard.nextActions.map((action, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg group">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span className="flex-1 text-slate-700">{action}</span>
                  <button
                    onClick={() => removeNextAction(index)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition"
                  >
                    ✕
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-slate-800">Recent Activity</h2>
          </div>
          
          <ul className="space-y-2">
            {activity.length === 0 ? (
              <li className="text-slate-500 text-sm italic">No recent activity</li>
            ) : (
              activity.map((item, index) => (
                <li key={index} className="flex items-start gap-3 p-2 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-slate-700 font-medium">{item.key}</span>
                    <span className="text-slate-500"> was {item.action}</span>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">
            {Math.round(Object.values(dashboard.progress).reduce((a, b) => a + b, 0) / 6)}%
          </div>
          <div className="text-sm text-blue-600 mt-1">Overall Progress</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-700">{dashboard.nextActions.length}</div>
          <div className="text-sm text-green-600 mt-1">Next Actions</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">{activity.length}</div>
          <div className="text-sm text-purple-600 mt-1">Recent Updates</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-2xl font-bold text-orange-700">
            {Object.values(dashboard.progress).filter(v => v === 100).length}
          </div>
          <div className="text-sm text-orange-600 mt-1">Completed Sections</div>
        </div>
      </div>
    </div>
  );
}
