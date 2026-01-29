'use client';

import { useEffect, useState } from 'react';
import { storage } from '../lib/storage';
import Sidebar from './Sidebar';
import DashboardHome from './sections/DashboardHome';
import ProblemOfPractice from './sections/ProblemOfPractice';
import LiteratureReview from './sections/LiteratureReview';
import ConceptualFramework from './sections/ConceptualFramework';
import Methods from './sections/Methods';
import DataEvidence from './sections/DataEvidence';
import Stakeholders from './sections/Stakeholders';
import WritingStudio from './sections/WritingStudio';
import Timeline from './sections/Timeline';
import Tasks from './sections/Tasks';
import Meetings from './sections/Meetings';
import Bibliography from './sections/Bibliography';
import Sources from './sections/Sources';
import Exports from './sections/Exports';
import CompletedPapers from './sections/CompletedPapers';

export default function Dashboard({ onLogout }) {
  const [currentSection, setCurrentSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // Initialize storage with defaults
    storage.initializeDefaults();
  }, []);

  const renderSection = () => {
    switch (currentSection) {
      case 'home':
        return <DashboardHome />;
      case 'pop':
        return <ProblemOfPractice />;
      case 'literature':
        return <LiteratureReview />;
      case 'framework':
        return <ConceptualFramework />;
      case 'methods':
        return <Methods />;
      case 'data':
        return <DataEvidence />;
      case 'stakeholders':
        return <Stakeholders />;
      case 'writing':
        return <WritingStudio />;
      case 'completedPapers':
        return <CompletedPapers />;
      case 'timeline':
        return <Timeline />;
      case 'tasks':
        return <Tasks />;
      case 'meetings':
        return <Meetings />;
      case 'bibliography':
        return <Bibliography />;
      case 'exports':
        return <Exports />;
      default:
        return <DashboardHome />;

    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search across all sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="ml-4 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            Logout
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
