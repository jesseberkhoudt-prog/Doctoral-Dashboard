'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  FiSearch,
  FiDownload,
  FiPrinter,
  FiExternalLink,
  FiX,
  FiChevronDown,
  FiSave,
  FiPlus,
  FiTrash2,
  FiEdit3,
} from 'react-icons/fi';

const BUCKET_META = [
  {
    bucket: 1,
    title: 'Bucket 1',
    subtitle: 'Background on the Problem: Student Success',
    desc:
      'Sources addressing foundational issues and challenges related to student success, including instructional rigidity, learning theories, and systemic constraints.',
    border: 'border-l-blue-500',
    pill: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    bucket: 2,
    title: 'Bucket 2',
    subtitle: 'Background on the Key Stakeholder Group: Frontline Faculty and Diverse Learners',
    desc:
      'Research focused on experiences, needs, and characteristics of key stakeholders, including inclusive pedagogy and organizational culture’s impact.',
    border: 'border-l-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    bucket: 3,
    title: 'Bucket 3',
    subtitle: 'Intervention and Reform: Inclusive, Adaptive, and Neuroaffirming Systems',
    desc:
      'Documents proposing and evaluating interventions, reforms, and strategies aimed at creating more inclusive and adaptive systems for sustainable change.',
    border: 'border-l-purple-500',
    pill: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

function doiToUrl(doi) {
  if (!doi) return null;
  const d = String(doi).trim();
  if (!d) return null;
  if (d.startsWith('http://') || d.startsWith('https://')) return d;
  return `https://doi.org/${d.replace(/^doi:\s*/i, '')}`;
}

function safeText(x) {
  return (x ?? '').toString();
}

function cleanText(x) {
  return safeText(x)
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  return String(tags)
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

function tagsToString(tags) {
  const arr = normalizeTags(tags);
  return arr.join(', ');
}

function authorsToString(authors) {
  if (!authors) return '';
  if (Array.isArray(authors)) {
    return authors
      .map(a => (a && typeof a === 'object' ? a.name : String(a)))
      .filter(Boolean)
      .join(', ');
  }
  if (typeof authors === 'string') return authors;
  return '';
}

function snippetFromText(text) {
  const a = cleanText(text);
  if (!a) return '';
  return a.length > 320 ? a.slice(0, 320).trim() + '…' : a;
}

function coerceYear(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

// Derive a usable title if title is missing.
// Tries to pull the segment after the year-ish part in APA citation: "Author. (2015). Title. Source."
function deriveTitleFromCitation(citation) {
  const c = cleanText(citation);
  if (!c) return '';
  const idx = c.indexOf(').');
  if (idx === -1) return '';
  let rest = c.slice(idx + 2).trim();
  if (!rest) return '';
  rest = rest.replace(/^[\s.]+/, '').trim();

  const m =
    rest.match(/^(.+?)\.\s+[A-Z(]/) ||
    rest.match(/^(.+?)\.$/) ||
    rest.match(/^(.+?)\./);

  let t = cleanText(m ? m[1] : rest);
  t = t.replace(/\s*\[[^\]]+\]\s*$/g, '').trim();
  return t;
}

function defaultForm() {
  return {
    title: '',
    year: '',
    item_type: '',
    source: '',
    doi: '',
    url: '',
    zotero_item_url: '',
    bucket_number: '',
    sub_bucket: '',
    mega_macro_micro: '',
    color_code: '',
    authors: '',
    tags: '',
    citation_apa: '',
    annotation_full: '',
    notes: '',
  };
}

// Convert form state -> DB payload
function formToPayload(form) {
  const payload = {
    title: cleanText(form.title) || null,
    year: form.year === '' ? null : coerceYear(form.year),
    item_type: cleanText(form.item_type) || null,
    source: cleanText(form.source) || null,
    doi: cleanText(form.doi) || null,
    url: cleanText(form.url) || null,
    zotero_item_url: cleanText(form.zotero_item_url) || null,
    bucket_number: form.bucket_number === '' ? null : Number(form.bucket_number),
    sub_bucket: cleanText(form.sub_bucket) || null,
    mega_macro_micro: cleanText(form.mega_macro_micro) || null,
    color_code: cleanText(form.color_code) || null,
    // keep authors as string for simplicity (works with your existing authorsToString)
    authors: cleanText(form.authors) || null,
    // store tags as array if you want; but your app supports both array + string.
    tags: normalizeTags(form.tags),
    citation_apa: safeText(form.citation_apa).trim() || null,
    annotation_full: safeText(form.annotation_full) || null,
    notes: safeText(form.notes) || null,
    updated_at: new Date().toISOString(),
  };

  // If tags are empty, store null instead of []
  if (!payload.tags || payload.tags.length === 0) payload.tags = null;

  return payload;
}

// Convert DB row -> form state
function rowToForm(row) {
  return {
    title: cleanText(row?.title) || deriveTitleFromCitation(row?.citation_apa) || '',
    year: row?.year ?? '',
    item_type: row?.item_type ?? '',
    source: row?.source ?? '',
    doi: row?.doi ?? '',
    url: row?.url ?? '',
    zotero_item_url: row?.zotero_item_url ?? '',
    bucket_number: row?.bucket_number ?? '',
    sub_bucket: row?.sub_bucket ?? '',
    mega_macro_micro: row?.mega_macro_micro ?? '',
    color_code: row?.color_code ?? '',
    authors: authorsToString(row?.authors) || '',
    tags: tagsToString(row?.tags) || '',
    citation_apa: row?.citation_apa ?? '',
    annotation_full: row?.annotation_full ?? '',
    notes: row?.notes ?? '',
  };
}

export default function Bibliography() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [query, setQuery] = useState('');
  const [year, setYear] = useState('All Years');
  const [type, setType] = useState('All Types');
  const [author, setAuthor] = useState('All Authors');
  const [selectedTags, setSelectedTags] = useState([]);
  const [categoryTab, setCategoryTab] = useState('All Categories');

  const [panelOpen, setPanelOpen] = useState(false);
  const [active, setActive] = useState(null);

  // Panel editable fields (notes/annotation only in-panel)
  const [editNotes, setEditNotes] = useState('');
  const [editAnnotation, setEditAnnotation] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Modal CRUD
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit
  const [modalId, setModalId] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [modalSaving, setModalSaving] = useState(false);
  const [modalMsg, setModalMsg] = useState('');

  async function loadItems() {
    try {
      setLoading(true);
      setErr('');

      const { data, error } = await supabase
        .from('bibliography_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const normalized = (data || []).map(r => {
        const title = cleanText(r.title) || deriveTitleFromCitation(r.citation_apa) || '[Untitled]';
        return {
          ...r,
          title,
          year: coerceYear(r.year),
          tags: normalizeTags(r.tags),
        };
      });

      setItems(normalized);
    } catch (e) {
      setErr(e?.message || 'Failed to load bibliography_items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  // When opening panel, hydrate editable fields
  useEffect(() => {
    if (!active) return;
    setEditNotes(safeText(active.notes));
    setEditAnnotation(safeText(active.annotation_full));
    setSaveMsg('');
  }, [active]);

  const years = useMemo(() => {
    const set = new Set(items.map(i => i.year).filter(v => typeof v === 'number'));
    return ['All Years', ...Array.from(set).sort((a, b) => b - a).map(String)];
  }, [items]);

  const types = useMemo(() => {
    const set = new Set(items.map(i => i.item_type).filter(Boolean).map(String));
    return ['All Types', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const authorsList = useMemo(() => {
    const set = new Set();
    items.forEach(i => {
      const s = authorsToString(i.authors);
      if (!s) return;
      s.split(',').map(x => x.trim()).filter(Boolean).forEach(x => set.add(x));
    });
    return ['All Authors', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const tagCloud = useMemo(() => {
    const map = new Map();
    items.forEach(i => {
      normalizeTags(i.tags).forEach(t => map.set(t, (map.get(t) || 0) + 1));
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([t]) => t);
  }, [items]);

  const countsByBucket = useMemo(() => {
    const map = new Map([[1, 0], [2, 0], [3, 0]]);
    items.forEach(i => {
      const b = Number(i.bucket_number);
      if (map.has(b)) map.set(b, (map.get(b) || 0) + 1);
    });
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter(i => {
      if (categoryTab === 'Student Success' && Number(i.bucket_number) !== 1) return false;
      if (categoryTab === 'Stakeholders' && Number(i.bucket_number) !== 2) return false;
      if (categoryTab === 'Interventions' && Number(i.bucket_number) !== 3) return false;

      if (year !== 'All Years' && String(i.year) !== year) return false;
      if (type !== 'All Types' && String(i.item_type || '') !== type) return false;

      if (author !== 'All Authors') {
        const s = authorsToString(i.authors);
        if (!s.includes(author)) return false;
      }

      if (selectedTags.length) {
        const ts = normalizeTags(i.tags);
        if (!selectedTags.every(t => ts.includes(t))) return false;
      }

      if (!q) return true;

      const hay = [
        i.title,
        i.source,
        i.citation_apa,
        i.annotation_full,
        i.notes,
        i.doi,
        i.url,
        i.sub_bucket,
        i.mega_macro_micro,
        authorsToString(i.authors),
        ...(normalizeTags(i.tags) || []),
      ]
        .map(x => safeText(x).toLowerCase())
        .join(' ');

      return hay.includes(q);
    });
  }, [items, query, year, type, author, selectedTags, categoryTab]);

  function toggleTag(t) {
    setSelectedTags(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  }

  function openPanel(row) {
    setActive(row);
    setPanelOpen(true);
  }

  async function savePanelEdits() {
    if (!active?.id) return;
    try {
      setSaving(true);
      setSaveMsg('');

      const payload = {
        notes: editNotes,
        annotation_full: editAnnotation,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('bibliography_items')
        .update(payload)
        .eq('id', active.id);

      if (error) throw error;

      setItems(prev => prev.map(x => (x.id === active.id ? { ...x, ...payload } : x)));
      setActive(prev => (prev ? { ...prev, ...payload } : prev));
      setSaveMsg('Saved.');
    } catch (e) {
      setSaveMsg(`Save failed: ${e?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  }

  function openCreateModal() {
    setModalMode('create');
    setModalId(null);
    setForm(defaultForm());
    setModalMsg('');
    setModalOpen(true);
  }

  function openEditModal(row) {
    setModalMode('edit');
    setModalId(row?.id ?? null);
    setForm(rowToForm(row));
    setModalMsg('');
    setModalOpen(true);
  }

  async function saveModal() {
    try {
      setModalSaving(true);
      setModalMsg('');

      const payload = formToPayload(form);

      if (modalMode === 'create') {
        const insertPayload = {
          ...payload,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('bibliography_items')
          .insert(insertPayload)
          .select('*')
          .single();

        if (error) throw error;

        const normalized = {
          ...data,
          title: cleanText(data.title) || deriveTitleFromCitation(data.citation_apa) || '[Untitled]',
          year: coerceYear(data.year),
          tags: normalizeTags(data.tags),
        };

        setItems(prev => [normalized, ...prev]);
        setModalMsg('Created.');
        setModalOpen(false);
      } else {
        if (!modalId) throw new Error('Missing item id for edit.');

        const { data, error } = await supabase
          .from('bibliography_items')
          .update(payload)
          .eq('id', modalId)
          .select('*')
          .single();

        if (error) throw error;

        const normalized = {
          ...data,
          title: cleanText(data.title) || deriveTitleFromCitation(data.citation_apa) || '[Untitled]',
          year: coerceYear(data.year),
          tags: normalizeTags(data.tags),
        };

        setItems(prev => prev.map(x => (x.id === modalId ? normalized : x)));
        // If panel is open for this item, sync it too
        setActive(prev => (prev?.id === modalId ? normalized : prev));
        setModalMsg('Updated.');
        setModalOpen(false);
      }
    } catch (e) {
      setModalMsg(e?.message || 'Save failed.');
    } finally {
      setModalSaving(false);
    }
  }

  async function deleteItem(row) {
    if (!row?.id) return;
    const ok = window.confirm('Delete this item permanently?');
    if (!ok) return;

    try {
      setSaveMsg('');
      const { error } = await supabase
        .from('bibliography_items')
        .delete()
        .eq('id', row.id);

      if (error) throw error;

      setItems(prev => prev.filter(x => x.id !== row.id));
      if (active?.id === row.id) {
        setPanelOpen(false);
        setActive(null);
      }
    } catch (e) {
      setSaveMsg(`Delete failed: ${e?.message || 'Unknown error'}`);
    }
  }

  function exportCSV() {
    const cols = [
      'title',
      'year',
      'item_type',
      'source',
      'doi',
      'url',
      'zotero_item_url',
      'bucket_number',
      'sub_bucket',
      'mega_macro_micro',
      'color_code',
      'citation_apa',
      'annotation_full',
      'notes',
      'authors',
      'tags',
    ];
    const escape = v => `"${String(v ?? '').replaceAll('"', '""')}"`;
    const lines = [
      cols.join(','),
      ...filtered.map(r => cols.map(c => escape(r[c])).join(',')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bibliography_export.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportBibTexPlaceholder() {
    const text = filtered
      .map((r, idx) => {
        const key = `ref${idx + 1}`;
        const y = r.year || '';
        const t = (r.title || r.citation_apa || '[Untitled]').replaceAll('{', '').replaceAll('}', '');
        const s = (r.source || '').replaceAll('{', '').replaceAll('}', '');
        return `@misc{${key},\n  title={${t}},\n  year={${y}},\n  howpublished={${s}},\n  note={${doiToUrl(r.doi) || r.url || ''}}\n}\n`;
      })
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bibliography_export.bib';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const Field = ({ label, children }) => (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-slate-600">{label}</div>
      {children}
    </div>
  );

  const Input = props => (
    <input
      {...props}
      className={[
        'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200',
        props.className || '',
      ].join(' ')}
    />
  );

  const TextArea = props => (
    <textarea
      {...props}
      className={[
        'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200',
        props.className || '',
      ].join(' ')}
    />
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Annotated Bibliography</h1>
        <p className="text-slate-600 text-sm mt-1">
          Educational Research: Student Success, Faculty Development &amp; Reform
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3 mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
            type="button"
          >
            <FiPlus /> Add Article
          </button>

          <button
            onClick={exportBibTexPlaceholder}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            type="button"
          >
            <FiDownload /> BibTeX
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
            type="button"
          >
            <FiDownload /> CSV
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700"
            type="button"
          >
            <FiPrinter /> Print
          </button>

          <button
            onClick={loadItems}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-slate-900 text-sm border border-slate-200 hover:bg-slate-50"
            type="button"
          >
            Refresh
          </button>
        </div>

        <div className="text-xs text-slate-500">
          {loading ? 'Loading…' : err ? `Error: ${err}` : `${items.length} items`}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-7">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-2">
              <FiSearch className="text-slate-500" /> Advanced Search
            </label>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search title, author, tags, notes, citation…"
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="text-xs font-semibold text-slate-600">Year</label>
            <div className="relative mt-1">
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white appearance-none"
              >
                {years.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className="text-xs font-semibold text-slate-600">Type</label>
            <div className="relative mt-1">
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white appearance-none"
              >
                {['All Types', ...types.filter(t => t !== 'All Types')].map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-4">
          <div className="lg:col-span-6">
            <label className="text-xs font-semibold text-slate-600">Filter by Author</label>
            <div className="relative mt-1">
              <select
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white appearance-none"
              >
                {authorsList.map(a => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <div className="lg:col-span-6">
            <label className="text-xs font-semibold text-slate-600">Filter by Tags (click to filter)</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {tagCloud.length === 0 ? (
                <span className="text-sm text-slate-500">No tags found.</span>
              ) : (
                tagCloud.map(t => {
                  const activeTag = selectedTags.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTag(t)}
                      className={[
                        'px-3 py-1.5 rounded-full text-xs border transition',
                        activeTag
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
                      ].join(' ')}
                      type="button"
                    >
                      {t}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {['All Categories', 'Student Success', 'Stakeholders', 'Interventions'].map(tab => (
            <button
              key={tab}
              onClick={() => setCategoryTab(tab)}
              className={[
                'px-3 py-2 rounded-lg border',
                categoryTab === tab
                  ? 'bg-white border-slate-900 text-slate-900 font-semibold'
                  : 'bg-white border-transparent text-slate-600 hover:text-slate-900',
              ].join(' ')}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {BUCKET_META.map(b => (
          <button
            key={b.bucket}
            onClick={() =>
              setCategoryTab(b.bucket === 1 ? 'Student Success' : b.bucket === 2 ? 'Stakeholders' : 'Interventions')
            }
            className={`text-left bg-white border border-slate-200 rounded-xl shadow-sm p-4 hover:bg-slate-50 transition border-l-4 ${b.border}`}
            type="button"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-900">{b.title}</div>
              <div className={`text-xs px-2 py-1 rounded-full border ${b.pill}`}>
                {countsByBucket.get(b.bucket) || 0} items
              </div>
            </div>
            <div className="mt-2 font-semibold text-slate-900 text-sm leading-snug">{b.subtitle}</div>
            <div className="mt-2 text-sm text-slate-600 leading-relaxed">{b.desc}</div>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="text-sm text-slate-600 mb-3">
        Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of{' '}
        <span className="font-semibold text-slate-900">{items.length}</span> documents
      </div>

      <div className="space-y-3">
        {!loading && !err && filtered.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-slate-600">
            No results. Clear filters or search.
          </div>
        )}

        {!loading &&
          !err &&
          filtered.map(row => {
            const title = row.title || deriveTitleFromCitation(row.citation_apa) || '[Untitled]';
            const doiUrl = doiToUrl(row.doi);
            const zotero = row.zotero_item_url;
            const authorText = authorsToString(row.authors);
            const snip = snippetFromText(row.annotation_full || row.notes);

            const bucket = Number(row.bucket_number);
            const border =
              bucket === 1
                ? 'border-l-blue-500'
                : bucket === 2
                ? 'border-l-emerald-500'
                : bucket === 3
                ? 'border-l-purple-500'
                : 'border-l-slate-300';

            return (
              <button
                key={row.id}
                onClick={() => openPanel(row)}
                className={`w-full text-left bg-white border border-slate-200 rounded-xl shadow-sm p-4 hover:bg-slate-50 transition border-l-4 ${border}`}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {row.sub_bucket ? (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {row.sub_bucket}
                        </span>
                      ) : row.bucket_number ? (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          Bucket {row.bucket_number}
                        </span>
                      ) : null}

                      {row.item_type ? (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                          {row.item_type}
                        </span>
                      ) : null}
                    </div>

                    <div className="font-semibold text-slate-900 text-lg leading-snug">{title}</div>

                    <div className="mt-1 text-sm text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {authorText ? <span>{authorText}</span> : null}
                      {row.year ? <span className="text-slate-400">•</span> : null}
                      {row.year ? <span>{row.year}</span> : null}
                      {row.source ? <span className="text-slate-400">•</span> : null}
                      {row.source ? <span>{row.source}</span> : null}
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-sm">
                      {doiUrl && (
                        <a
                          href={doiUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                          onClick={e => e.stopPropagation()}
                        >
                          DOI <FiExternalLink className="opacity-70" />
                        </a>
                      )}
                      {zotero && (
                        <a
                          href={zotero}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                          onClick={e => e.stopPropagation()}
                        >
                          Zotero <FiExternalLink className="opacity-70" />
                        </a>
                      )}
                    </div>

                    {snip ? (
                      <div className="mt-3 text-sm text-slate-700 leading-relaxed">
                        {snip} <span className="text-blue-700 font-medium">Read more</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
      </div>

      {/* Side panel */}
      {panelOpen && active && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setPanelOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full sm:w-[720px] bg-white z-50 border-l border-slate-200 shadow-2xl overflow-auto">
            <div className="p-4 border-b border-slate-200 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-lg font-semibold text-slate-900">
                  {active.title || deriveTitleFromCitation(active.citation_apa) || '[Untitled]'}
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  {active.year ? `${active.year}` : ''}
                  {active.item_type ? ` · ${active.item_type}` : ''}
                  {active.bucket_number ? ` · Bucket ${active.bucket_number}` : ''}
                  {active.sub_bucket ? ` · ${active.sub_bucket}` : ''}
                </div>

                <div className="mt-2 flex items-center gap-3 text-sm">
                  {active.doi ? (
                    <a
                      href={doiToUrl(active.doi)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                    >
                      DOI <FiExternalLink className="opacity-70" />
                    </a>
                  ) : null}
                  {active.zotero_item_url ? (
                    <a
                      href={active.zotero_item_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                    >
                      Zotero <FiExternalLink className="opacity-70" />
                    </a>
                  ) : null}
                </div>
              </div>

              <button
                onClick={() => setPanelOpen(false)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                type="button"
              >
                <FiX />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(active)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-slate-200 hover:bg-slate-50"
                  type="button"
                >
                  <FiEdit3 /> Edit item
                </button>
                <button
                  onClick={() => deleteItem(active)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-red-200 text-red-700 hover:bg-red-50"
                  type="button"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="text-xs font-semibold text-slate-600">Full Annotation (editable)</div>
                  <button
                    onClick={savePanelEdits}
                    disabled={saving}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                      saving
                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                        : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                    }`}
                    type="button"
                  >
                    <FiSave /> {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
                <textarea
                  value={editAnnotation}
                  onChange={e => setEditAnnotation(e.target.value)}
                  className="w-full min-h-[220px] border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
                {saveMsg ? <div className="mt-2 text-xs text-slate-600">{saveMsg}</div> : null}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-600 mb-2">Notes (editable)</div>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full min-h-[140px] border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-600 mb-2">APA Citation</div>
                <div className="text-sm text-slate-800 whitespace-pre-wrap">
                  {active.citation_apa || '—'}
                </div>
              </div>

              {saveMsg && saveMsg.startsWith('Delete failed') ? (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {saveMsg}
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-auto">
            <div
              className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-slate-900">
                    {modalMode === 'create' ? 'Add Article' : 'Edit Article'}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Fill what you have now — you can always edit later.
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                  type="button"
                >
                  <FiX />
                </button>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Title">
                  <Input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Article / book / report title"
                  />
                </Field>

                <Field label="Year">
                  <Input
                    value={form.year}
                    onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                    placeholder="e.g., 2024"
                  />
                </Field>

                <Field label="Type">
                  <Input
                    value={form.item_type}
                    onChange={e => setForm(f => ({ ...f, item_type: e.target.value }))}
                    placeholder="Journal article / report / book / policy…"
                  />
                </Field>

                <Field label="Source / Journal / Publisher">
                  <Input
                    value={form.source}
                    onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                    placeholder="e.g., Review of Educational Research"
                  />
                </Field>

                <Field label="Authors (comma-separated)">
                  <Input
                    value={form.authors}
                    onChange={e => setForm(f => ({ ...f, authors: e.target.value }))}
                    placeholder="Last, F., Last, F."
                  />
                </Field>

                <Field label="Tags (comma-separated)">
                  <Input
                    value={form.tags}
                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                    placeholder="neurodiversity, inclusion, systems"
                  />
                </Field>

                <Field label="DOI">
                  <Input
                    value={form.doi}
                    onChange={e => setForm(f => ({ ...f, doi: e.target.value }))}
                    placeholder="10.xxxx/xxxxx"
                  />
                </Field>

                <Field label="URL">
                  <Input
                    value={form.url}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="https://..."
                  />
                </Field>

                <Field label="Zotero Item URL">
                  <Input
                    value={form.zotero_item_url}
                    onChange={e => setForm(f => ({ ...f, zotero_item_url: e.target.value }))}
                    placeholder="https://www.zotero.org/..."
                  />
                </Field>

                <Field label="Bucket Number (1–3)">
                  <Input
                    value={form.bucket_number}
                    onChange={e => setForm(f => ({ ...f, bucket_number: e.target.value }))}
                    placeholder="1, 2, or 3"
                  />
                </Field>

                <Field label="Sub-bucket">
                  <Input
                    value={form.sub_bucket}
                    onChange={e => setForm(f => ({ ...f, sub_bucket: e.target.value }))}
                    placeholder="e.g., Identity Suppression"
                  />
                </Field>

                <Field label="Mega/Macro/Micro">
                  <Input
                    value={form.mega_macro_micro}
                    onChange={e => setForm(f => ({ ...f, mega_macro_micro: e.target.value }))}
                    placeholder="Mega / Macro / Micro"
                  />
                </Field>

                <Field label="Color Code">
                  <Input
                    value={form.color_code}
                    onChange={e => setForm(f => ({ ...f, color_code: e.target.value }))}
                    placeholder="Optional"
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="APA Citation (optional but recommended)">
                    <TextArea
                      value={form.citation_apa}
                      onChange={e => setForm(f => ({ ...f, citation_apa: e.target.value }))}
                      rows={4}
                      placeholder="Paste the APA citation here"
                    />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Field label="Full Annotation">
                    <TextArea
                      value={form.annotation_full}
                      onChange={e => setForm(f => ({ ...f, annotation_full: e.target.value }))}
                      rows={6}
                      placeholder="Your annotation text"
                    />
                  </Field>
                </div>

                <div className="md:col-span-2">
                  <Field label="Notes">
                    <TextArea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      rows={4}
                      placeholder="Extra notes"
                    />
                  </Field>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  {modalMsg ? modalMsg : ' '}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm border border-slate-200 hover:bg-slate-50"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveModal}
                    disabled={modalSaving}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                      modalSaving
                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                        : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                    }`}
                    type="button"
                  >
                    <FiSave /> {modalSaving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
