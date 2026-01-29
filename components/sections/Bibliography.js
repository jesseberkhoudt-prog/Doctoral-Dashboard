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
  FiGrid,
  FiList,
  FiColumns,
  FiSave,
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

function cleanText(x) {
  return (x ?? '')
    .toString()
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => cleanText(t)).filter(Boolean);
  return cleanText(tags)
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

function authorsToString(authors) {
  if (!authors) return '';
  if (Array.isArray(authors)) {
    return authors
      .map(a => (typeof a === 'object' ? a.name : a))
      .filter(Boolean)
      .join(', ');
  }
  return cleanText(authors);
}

function snippetFromText(text) {
  const t = cleanText(text);
  return t.length > 320 ? t.slice(0, 320) + '…' : t;
}

function coerceYear(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function deriveTitleFromCitation(citation) {
  const c = cleanText(citation);
  if (!c) return '';
  const idx = c.indexOf(').');
  if (idx === -1) return '';
  let rest = c.slice(idx + 2).replace(/^[\s.]+/, '');
  const m =
    rest.match(/^(.+?)\.\s+[A-Z(]/) ||
    rest.match(/^(.+?)\.$/) ||
    rest.match(/^(.+?)\./);
  return cleanText(m ? m[1] : rest);
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

  const [viewMode, setViewMode] = useState('list');
  const [panelOpen, setPanelOpen] = useState(false);
  const [active, setActive] = useState(null);

  const [editNotes, setEditNotes] = useState('');
  const [editAnnotation, setEditAnnotation] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('bibliography_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setItems(
          (data || []).map(r => ({
            ...r,
            title:
              cleanText(r.title) ||
              deriveTitleFromCitation(r.citation_apa) ||
              '[Untitled]',
            year: coerceYear(r.year),
            tags: normalizeTags(r.tags),
          }))
        );
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!active) return;
    setEditNotes(cleanText(active.notes));
    setEditAnnotation(cleanText(active.annotation_full));
  }, [active]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i => {
      if (year !== 'All Years' && String(i.year) !== year) return false;
      if (type !== 'All Types' && i.item_type !== type) return false;
      if (author !== 'All Authors' && !authorsToString(i.authors).includes(author)) return false;
      if (selectedTags.length && !selectedTags.every(t => i.tags.includes(t))) return false;

      if (!q) return true;

      return [
        i.title,
        i.citation_apa,
        i.annotation_full,
        i.notes,
        authorsToString(i.authors),
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, year, type, author, selectedTags]);

  async function savePanelEdits() {
    if (!active) return;
    setSaving(true);
    await supabase
      .from('bibliography_items')
      .update({
        notes: editNotes,
        annotation_full: editAnnotation,
        updated_at: new Date().toISOString(),
      })
      .eq('id', active.id);

    setItems(items =>
      items.map(i =>
        i.id === active.id
          ? { ...i, notes: editNotes, annotation_full: editAnnotation }
          : i
      )
    );
    setActive(a => ({ ...a, notes: editNotes, annotation_full: editAnnotation }));
    setSaving(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        Annotated Bibliography
      </h1>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search bibliography…"
        className="w-full mb-4 border rounded-lg px-3 py-2"
      />

      <div className="space-y-3">
        {!loading &&
          !err &&
          filtered.map(row => (
            <button
              key={row.id}
              onClick={() => {
                setActive(row);
                setPanelOpen(true);
              }}
              className="w-full text-left bg-white border rounded-xl p-4 hover:bg-slate-50"
            >
              <div className="font-semibold text-lg">{row.title}</div>
              <div className="text-sm text-slate-600">
                {authorsToString(row.authors)}
                {row.year ? ` • ${row.year}` : ''}
              </div>
              {row.annotation_full && (
                <div className="mt-2 text-sm text-slate-700">
                  {snippetFromText(row.annotation_full)}
                </div>
              )}
            </button>
          ))}
      </div>

      {panelOpen && active && (
        <>
          <div className="fixed inset-0 bg-black/30" onClick={() => setPanelOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full sm:w-[700px] bg-white shadow-xl p-4 overflow-auto">
            <button
              onClick={() => setPanelOpen(false)}
              className="absolute top-3 right-3"
            >
              <FiX />
            </button>

            <h2 className="text-xl font-semibold mb-2">{active.title}</h2>

            <textarea
              value={editAnnotation}
              onChange={e => setEditAnnotation(e.target.value)}
              className="w-full min-h-[200px] border rounded-lg p-3 mb-4"
            />

            <textarea
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              className="w-full min-h-[120px] border rounded-lg p-3 mb-4"
            />

            <button
              onClick={savePanelEdits}
              disabled={saving}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
