'use client';

import { FiHome, FiBook, FiLayers, FiTarget, FiDatabase, FiUsers, FiEdit3, FiCalendar, FiCheckSquare, FiMessageSquare, FiBookmark, FiDownload, FiFileText } from 'react-icons/fi';

const menuItems = [
  { id: 'home', label: 'Dashboard', icon: FiHome },
  { id: 'pop', label: 'Problem of Practice', icon: FiTarget },
  { id: 'literature', label: 'Literature Review', icon: FiBook },
  { id: 'framework', label: 'Conceptual Framework', icon: FiLayers },
  { id: 'methods', label: 'Methods', icon: FiCheckSquare },
  { id: 'data', label: 'Data & Evidence', icon: FiDatabase },
  { id: 'stakeholders', label: 'Stakeholders', icon: FiUsers },
  { id: 'writing', label: 'Writing Studio', icon: FiEdit3 },
  { id: 'timeline', label: 'Timeline', icon: FiCalendar },
  { id: 'tasks', label: 'Tasks', icon: FiCheckSquare },
  { id: 'meetings', label: 'Meetings', icon: FiMessageSquare },
  { id: 'bibliography', label: 'Bibliography', icon: FiBookmark },
  { id: 'exports', label: 'Exports', icon: FiDownload },
  { id: 'completedPapers', label: 'Completed Papers', icon: FiFileText },

];

export default function Sidebar({ currentSection, onSectionChange, isOpen, onToggle }) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-xl font-bold text-slate-800">Doctoral Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Research Cockpit</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onSectionChange(item.id);
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-colors duration-200
                        ${isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 text-center">
              v1.0.0 • 2026
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
