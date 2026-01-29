'use client';

import { useEffect, useState } from 'react';
import { storage } from '../../lib/storage';
import RichTextEditor from '../RichTextEditor';
import { FiPlus, FiTrash2, FiEdit2, FiChevronDown, FiChevronRight } from 'react-icons/fi';

export default function LiteratureReview() {
  const [buckets, setBuckets] = useState([]);
  const [view, setView] = useState('outline'); // 'outline' or 'narrative'
  const [narrativeContent, setNarrativeContent] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const sections = storage.get('sections') || {};
    const lit = sections.literatureReview || { buckets: [], content: '' };
    setBuckets(lit.buckets || []);
    setNarrativeContent(lit.content || '');
  };

  const saveData = (newBuckets, newContent = narrativeContent) => {
    const sections = storage.get('sections') || {};
    sections.literatureReview = {
      ...sections.literatureReview,
      buckets: newBuckets,
      content: newContent,
      lastEdited: new Date().toISOString()
    };
    storage.set('sections', sections);
  };

  const addBucket = () => {
    const name = prompt('Enter bucket name (e.g., "Theoretical Frameworks", "Methodology"):');
    if (name) {
      const newBuckets = [...buckets, {
        id: Date.now(),
        name,
        subBuckets: [],
        notes: '',
        expanded: true
      }];
      setBuckets(newBuckets);
      saveData(newBuckets);
    }
  };

  const addSubBucket = (bucketId) => {
    const name = prompt('Enter sub-bucket name:');
    if (name) {
      const newBuckets = buckets.map(b => {
        if (b.id === bucketId) {
          return {
            ...b,
            subBuckets: [...b.subBuckets, {
              id: Date.now(),
              name,
              sources: [],
              notes: ''
            }]
          };
        }
        return b;
      });
      setBuckets(newBuckets);
      saveData(newBuckets);
    }
  };

  const deleteBucket = (bucketId) => {
    if (confirm('Delete this bucket and all its contents?')) {
      const newBuckets = buckets.filter(b => b.id !== bucketId);
      setBuckets(newBuckets);
      saveData(newBuckets);
    }
  };

  const toggleBucket = (bucketId) => {
    const newBuckets = buckets.map(b => {
      if (b.id === bucketId) {
        return { ...b, expanded: !b.expanded };
      }
      return b;
    });
    setBuckets(newBuckets);
  };

  const updateBucketNotes = (bucketId, notes) => {
    const newBuckets = buckets.map(b => {
      if (b.id === bucketId) {
        return { ...b, notes };
      }
      return b;
    });
    setBuckets(newBuckets);
    saveData(newBuckets);
  };

  const addSource = (bucketId, subBucketId) => {
    const source = prompt('Enter source citation or note:');
    if (source) {
      const newBuckets = buckets.map(b => {
        if (b.id === bucketId) {
          return {
            ...b,
            subBuckets: b.subBuckets.map(sb => {
              if (sb.id === subBucketId) {
                return {
                  ...sb,
                  sources: [...sb.sources, { id: Date.now(), text: source }]
                };
              }
              return sb;
            })
          };
        }
        return b;
      });
      setBuckets(newBuckets);
      saveData(newBuckets);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Literature Review Builder</h1>
          <p className="text-slate-600">Organize your literature into buckets and synthesize findings.</p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('outline')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'outline'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Outline View
          </button>
          <button
            onClick={() => setView('narrative')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'narrative'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Narrative Draft
          </button>
        </div>

        {view === 'outline' ? (
          <div>
            <button
              onClick={addBucket}
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <FiPlus /> Add Bucket
            </button>

            {buckets.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>No buckets yet. Create your first bucket to organize literature.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {buckets.map(bucket => (
                  <div key={bucket.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleBucket(bucket.id)}>
                          {bucket.expanded ? <FiChevronDown /> : <FiChevronRight />}
                        </button>
                        <h3 className="font-semibold text-slate-800">{bucket.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addSubBucket(bucket.id)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          + Sub-bucket
                        </button>
                        <button
                          onClick={() => deleteBucket(bucket.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    {bucket.expanded && (
                      <div className="p-4 space-y-4">
                        {bucket.subBuckets.map(sub => (
                          <div key={sub.id} className="bg-slate-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-slate-700">{sub.name}</h4>
                              <button
                                onClick={() => addSource(bucket.id, sub.id)}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                + Source
                              </button>
                            </div>
                            {sub.sources.length > 0 && (
                              <ul className="space-y-1 text-sm text-slate-600">
                                {sub.sources.map(source => (
                                  <li key={source.id} className="ml-4">• {source.text}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Bucket Notes & Synthesis:
                          </label>
                          <textarea
                            value={bucket.notes}
                            onChange={(e) => updateBucketNotes(bucket.id, e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows="3"
                            placeholder="Add synthesis notes for this bucket..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-600 mb-4">
              Write your narrative literature review here, drawing from your organized buckets.
            </p>
            <RichTextEditor
              value={narrativeContent}
              onChange={(content) => {
                setNarrativeContent(content);
                saveData(buckets, content);
              }}
              placeholder="Begin writing your literature review narrative..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
