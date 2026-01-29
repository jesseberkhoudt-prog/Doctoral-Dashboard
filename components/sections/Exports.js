'use client';

import { storage } from '../../lib/storage';
import { FiDownload, FiFileText, FiDatabase } from 'react-icons/fi';

export default function Exports() {
  const exportToJSON = () => {
    const data = storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doctoral-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSection = (sectionKey, sectionName) => {
    const sections = storage.get('sections') || {};
    const section = sections[sectionKey];
    
    if (!section) {
      alert('No content to export for this section.');
      return;
    }

    let content = '';
    if (section.content) {
      // Strip HTML tags for plain text export
      content = section.content.replace(/<[^>]*>/g, '');
    } else if (section.buckets) {
      // Literature review special handling
      content = `# ${sectionName}\n\n`;
      section.buckets.forEach(bucket => {
        content += `## ${bucket.name}\n\n`;
        if (bucket.notes) content += `${bucket.notes}\n\n`;
        bucket.subBuckets.forEach(sub => {
          content += `### ${sub.name}\n\n`;
          sub.sources.forEach(source => {
            content += `- ${source.text}\n`;
          });
          content += '\n';
        });
      });
    } else if (section.chapters) {
      // Writing studio special handling
      section.chapters.forEach(chapter => {
        content += `# ${chapter.title}\n\n`;
        content += chapter.content.replace(/<[^>]*>/g, '');
        content += '\n\n---\n\n';
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sectionKey}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sections = [
    { key: 'pop', name: 'Problem of Practice' },
    { key: 'literatureReview', name: 'Literature Review' },
    { key: 'conceptualFramework', name: 'Conceptual Framework' },
    { key: 'methods', name: 'Methods' },
    { key: 'stakeholders', name: 'Stakeholders' },
    { key: 'writing', name: 'Writing Studio' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Exports & Backups</h1>
          <p className="text-slate-600">Export your work and create backups of your research.</p>
        </div>

        {/* Full Backup */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-lg">
              <FiDatabase size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Complete Backup</h2>
              <p className="text-slate-600 mb-4">
                Export all your dashboard data including all sections, progress, tasks, and settings.
              </p>
              <button
                onClick={exportToJSON}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
              >
                <FiDownload /> Download Full Backup (JSON)
              </button>
            </div>
          </div>
        </div>

        {/* Individual Sections */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Export Individual Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map(section => (
              <div
                key={section.key}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <FiFileText className="text-slate-600" />
                  <h3 className="font-medium text-slate-800">{section.name}</h3>
                </div>
                <button
                  onClick={() => exportSection(section.key, section.name)}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition text-sm font-medium"
                >
                  Export as Text
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-semibold text-amber-900 mb-2">📋 Export Information</h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Full backups are saved as JSON files containing all your data</li>
            <li>• Individual sections are exported as plain text files</li>
            <li>• For DOCX/PDF exports, copy the text and use your preferred word processor</li>
            <li>• Regular backups are recommended to prevent data loss</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
