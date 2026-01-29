'use client';

import { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

export default function Tasks() {
  const [columns, setColumns] = useState({ todo: [], inProgress: [], done: [] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const sections = storage.get('sections') || {};
    const tasks = sections.tasks || { columns: { todo: [], inProgress: [], done: [] } };
    setColumns(tasks.columns);
  };

  const saveData = (newColumns) => {
    const sections = storage.get('sections') || {};
    sections.tasks = {
      ...sections.tasks,
      columns: newColumns,
      lastEdited: new Date().toISOString()
    };
    storage.set('sections', sections);
  };

  const addTask = (column) => {
    const title = prompt('Task title:');
    if (title) {
      const newTask = {
        id: Date.now(),
        title,
        created: new Date().toISOString()
      };
      const newColumns = { ...columns };
      newColumns[column].push(newTask);
      setColumns(newColumns);
      saveData(newColumns);
    }
  };

  const moveTask = (taskId, fromColumn, toColumn) => {
    const newColumns = { ...columns };
    const taskIndex = newColumns[fromColumn].findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      const [task] = newColumns[fromColumn].splice(taskIndex, 1);
      newColumns[toColumn].push(task);
      setColumns(newColumns);
      saveData(newColumns);
    }
  };

  const deleteTask = (taskId, column) => {
    if (confirm('Delete this task?')) {
      const newColumns = { ...columns };
      newColumns[column] = newColumns[column].filter(t => t.id !== taskId);
      setColumns(newColumns);
      saveData(newColumns);
    }
  };

  const columnConfig = [
    { key: 'todo', title: 'To Do', color: 'slate' },
    { key: 'inProgress', title: 'In Progress', color: 'blue' },
    { key: 'done', title: 'Done', color: 'green' }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Tasks / Kanban Board</h1>
          <p className="text-slate-600">Manage your research tasks with a visual board.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columnConfig.map(col => (
            <div key={col.key} className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`font-semibold text-${col.color}-800`}>
                  {col.title} ({columns[col.key].length})
                </h2>
                <button
                  onClick={() => addTask(col.key)}
                  className={`p-1 bg-${col.color}-600 text-white rounded hover:bg-${col.color}-700`}
                >
                  <FiPlus size={16} />
                </button>
              </div>

              <div className="space-y-2">
                {columns[col.key].map(task => (
                  <div
                    key={task.id}
                    className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-slate-800">{task.title}</p>
                      <button
                        onClick={() => deleteTask(task.id, col.key)}
                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:bg-red-50 rounded p-1"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="flex gap-1">
                      {col.key !== 'todo' && (
                        <button
                          onClick={() => moveTask(task.id, col.key, 'todo')}
                          className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded"
                        >
                          ← To Do
                        </button>
                      )}
                      {col.key !== 'inProgress' && (
                        <button
                          onClick={() => moveTask(task.id, col.key, 'inProgress')}
                          className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
                        >
                          {col.key === 'todo' ? '→' : '←'} In Progress
                        </button>
                      )}
                      {col.key !== 'done' && (
                        <button
                          onClick={() => moveTask(task.id, col.key, 'done')}
                          className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 rounded"
                        >
                          → Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
