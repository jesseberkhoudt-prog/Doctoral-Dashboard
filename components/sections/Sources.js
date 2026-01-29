'use client';

import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X, Save, Search, Filter } from 'lucide-react';

export default function Sources() {
  const [sources, setSources] = useState([]);
  const [filteredSources, setFilteredSources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBucket, setFilterBucket] = useState('all');
  const [filterLens, setFilterLens] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState({
    citation_apa: '',
    annotation_full: '',
    doi: '',
    zotero_item_url: '',
    year: '',
    bucket: '',
    bucket_number: 0,
    color_code: '',
    mega_macro_micro: '',
    sub_bucket: '',
    tags: []
  });

  // Load sources from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('doctoral_dashboard_sources');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSources(parsed);
      setFilteredSources(parsed);
    }
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...sources];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.citation_apa.toLowerCase().includes(term) ||
        s.annotation_full.toLowerCase().includes(term) ||
        (s.tags && s.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Bucket filter
    if (filterBucket !== 'all') {
      filtered = filtered.filter(s => s.bucket === filterBucket);
    }

    // Lens filter
    if (filterLens !== 'all') {
      filtered = filtered.filter(s => s.mega_macro_micro === filterLens);
    }

    setFilteredSources(filtered);
  }, [searchTerm, filterBucket, filterLens, sources]);

  const saveSources = (updatedSources) => {
    localStorage.setItem('doctoral_dashboard_sources', JSON.stringify(updatedSources));
    setSources(updatedSources);
  };

  const handleAddSource = () => {
    if (!newSource.citation_apa || !newSource.annotation_full) {
      alert('Citation and annotation are required');
      return;
    }

    const sourceToAdd = {
      ...newSource,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };

    const updated = [...sources, sourceToAdd];
    saveSources(updated);
    
    // Reset form
    setNewSource({
      citation_apa: '',
      annotation_full: '',
      doi: '',
      zotero_item_url: '',
      year: '',
      bucket: '',
      bucket_number: 0,
      color_code: '',
      mega_macro_micro: '',
      sub_bucket: '',
      tags: []
    });
    setShowAddForm(false);
  };

  const handleEditSource = (source) => {
    setEditingId(source.id);
    setEditForm({ ...source });
  };

  const handleSaveEdit = () => {
    const updated = sources.map(s => 
      s.id === editingId ? editForm : s
    );
    saveSources(updated);
    setEditingId(null);
    setEditForm(null);
  };

  const handleDeleteSource = (id) => {
    if (confirm('Are you sure you want to delete this source? This action cannot be undone.')) {
      const updated = sources.filter(s => s.id !== id);
      saveSources(updated);
    }
  };

  const getBucketColor = (colorCode) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      gold: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colors[colorCode] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getLensColor = (lens) => {
    const colors = {
      MEGA: 'bg-red-100 text-red-800',
      MACRO: 'bg-orange-100 text-orange-800',
      MICRO: 'bg-teal-100 text-teal-800'
    };
    return colors[lens] || 'bg-gray-100 text-gray-800';
  };

  const buckets = [
    { value: 'Background on the Problem: Student Success', label: 'Bucket 1: Student Success', color: 'blue', number: 1 },
    { value: 'Background on the Key Stakeholder Group: Frontline Faculty and Diverse Learners', label: 'Bucket 2: Stakeholders', color: 'green', number: 2 },
    { value: 'Intervention and Reform: Inclusive, Adaptive, and Neuroaffirming Systems', label: 'Bucket 3: Interventions', color: 'purple', number: 3 },
    { value: 'Foundational Theory', label: 'Foundational Theory', color: 'gold', number: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sources (Bibliography)</h2>
          <p className="text-sm text-gray-600 mt-1">
            {sources.length} total sources | {filteredSources.length} displayed
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Source
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search citations, annotations, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bucket Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterBucket}
              onChange={(e) => setFilterBucket(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Buckets</option>
              {buckets.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          {/* Lens Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterLens}
              onChange={(e) => setFilterLens(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Lenses</option>
              <option value="MEGA">MEGA</option>
              <option value="MACRO">MACRO</option>
              <option value="MICRO">MICRO</option>
              <option value="">Unclassified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Source Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Add New Source</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Citation (APA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSource.citation_apa}
                  onChange={(e) => setNewSource({...newSource, citation_apa: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Author, A. (Year). Title. Journal, Volume(Issue), pages. DOI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Annotation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newSource.annotation_full}
                  onChange={(e) => setNewSource({...newSource, annotation_full: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Complete annotation text..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DOI</label>
                  <input
                    type="text"
                    value={newSource.doi}
                    onChange={(e) => setNewSource({...newSource, doi: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="10.xxxx/xxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={newSource.year}
                    onChange={(e) => setNewSource({...newSource, year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zotero Item URL</label>
                <input
                  type="text"
                  value={newSource.zotero_item_url}
                  onChange={(e) => setNewSource({...newSource, zotero_item_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="zotero://select/library/items/XXXXXXXX"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bucket</label>
                  <select
                    value={newSource.bucket}
                    onChange={(e) => {
                      const selected = buckets.find(b => b.value === e.target.value);
                      setNewSource({
                        ...newSource, 
                        bucket: e.target.value,
                        bucket_number: selected?.number || 0,
                        color_code: selected?.color || ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select bucket...</option>
                    {buckets.map(b => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lens (MEGA/MACRO/MICRO)</label>
                  <select
                    value={newSource.mega_macro_micro}
                    onChange={(e) => setNewSource({...newSource, mega_macro_micro: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unclassified</option>
                    <option value="MEGA">MEGA</option>
                    <option value="MACRO">MACRO</option>
                    <option value="MICRO">MICRO</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSource}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Add Source
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sources List */}
      <div className="space-y-4">
        {filteredSources.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No sources found matching your filters.</p>
          </div>
        ) : (
          filteredSources.map((source) => (
            <div key={source.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {editingId === source.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Citation (APA)</label>
                    <input
                      type="text"
                      value={editForm.citation_apa}
                      onChange={(e) => setEditForm({...editForm, citation_apa: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Annotation</label>
                    <textarea
                      value={editForm.annotation_full}
                      onChange={(e) => setEditForm({...editForm, annotation_full: e.target.value})}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DOI</label>
                      <input
                        type="text"
                        value={editForm.doi}
                        onChange={(e) => setEditForm({...editForm, doi: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <input
                        type="text"
                        value={editForm.year}
                        onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bucket</label>
                      <select
                        value={editForm.bucket}
                        onChange={(e) => {
                          const selected = buckets.find(b => b.value === e.target.value);
                          setEditForm({
                            ...editForm,
                            bucket: e.target.value,
                            bucket_number: selected?.number || 0,
                            color_code: selected?.color || ''
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {buckets.map(b => (
                          <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lens</label>
                      <select
                        value={editForm.mega_macro_micro}
                        onChange={(e) => setEditForm({...editForm, mega_macro_micro: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Unclassified</option>
                        <option value="MEGA">MEGA</option>
                        <option value="MACRO">MACRO</option>
                        <option value="MICRO">MICRO</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditForm(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {source.color_code && (
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getBucketColor(source.color_code)}`}>
                            {source.bucket.split(':')[0]}
                          </span>
                        )}
                        {source.mega_macro_micro && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getLensColor(source.mega_macro_micro)}`}>
                            {source.mega_macro_micro}
                          </span>
                        )}
                        {source.year && (
                          <span className="text-xs text-gray-500">({source.year})</span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {source.citation_apa}
                      </h3>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditSource(source)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit source"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSource(source.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete source"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {source.annotation_full}
                  </div>

                  <div className="flex gap-4 text-sm">
                    {source.doi && (
                      <a
                        href={`https://doi.org/${source.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        DOI: {source.doi}
                      </a>
                    )}
                    {source.zotero_item_url && (
                      <a
                        href={source.zotero_item_url}
                        className="text-blue-600 hover:underline"
                      >
                        Open in Zotero
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
