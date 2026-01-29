'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function BibliographyAdminClient() {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [itemType, setItemType] = useState('article');
  const [source, setSource] = useState('');
  const [doi, setDoi] = useState('');
  const [url, setUrl] = useState('');
  const [bucket, setBucket] = useState('Macro');
  const [notes, setNotes] = useState('');
  const [authorsRaw, setAuthorsRaw] = useState(''); // "Last, First; Last, First"
  const [tagsRaw, setTagsRaw] = useState('');       // "tag1, tag2"

  const [status, setStatus] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  function parseAuthors(input) {
    if (!input.trim()) return [];
    return input
      .split(';')
      .map(s => s.trim())
      .filter(Boolean)
      .map(name => {
        const [last, first] = name.split(',').map(x => (x || '').trim());
        if (!last && !first) return null;
        return { last: last || '', first: first || '' };
      })
      .filter(Boolean);
  }

  function parseTags(input) {
    if (!input.trim()) return [];
    return input.split(',').map(s => s.trim()).filter(Boolean);
  }

  async function loadItems() {
    setStatus('');
    const { data, error } = await supabase
      .from('bibliography_items')
      .select('*')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return setStatus(error.message);
    setItems(data || []);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function addItem(e) {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      if (!title.trim()) throw new Error('Title is required.');

      const payload = {
        title: title.trim(),
        year: year ? Number(year) : null,
        item_type: itemType || null,
        source: source.trim() || null,
        doi: doi.trim() || null,
        url: url.trim() || null,
        bucket: bucket || null,
        notes: notes.trim() || null,
        authors: parseAuthors(authorsRaw),
        tags: parseTags(tagsRaw),
      };

      const { error } = await supabase.from('bibliography_items').insert(payload);
      if (error) throw error;

      setTitle('');
      setYear('');
      setItemType('article');
      setSource('');
      setDoi('');
      setUrl('');
      setBucket('Macro');
      setNotes('');
      setAuthorsRaw('');
      setTagsRaw('');
      setStatus('Saved.');

      await loadItems();
    } catch (err) {
      setStatus(err.message || 'Save failed.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id) {
    setStatus('');
    const { error } = await supabase.from('bibliography_items').delete().eq('id', id);
    if (error) return setStatus(error.message);
    setStatus('Deleted.');
    await loadItems();
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Bibliography Admin</h1>

      <form onSubmit={addItem} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm">
            <div className="font-medium mb-1">Title *</div>
            <input className="w-full border rounded-md p-2" value={title} onChange={e => setTitle(e.target.value)} />
          </label>

          <label className="text-sm">
            <div className="font-medium mb-1">Year</div>
            <input className="w-full border rounded-md p-2" value={year} onChange={e => setYear(e.target.value)} />
          </label>

          <label className="text-sm">
            <div className="font-medium mb-1">Type</div>
            <select className="w-full border rounded-md p-2" value={itemType} onChange={e => setItemType(e.target.value)}>
              <option value="article">Article</option>
              <option value="book">Book</option>
              <option value="report">Report</option>
              <option value="thesis">Thesis</option>
              <option value="webpage">Webpage</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="text-sm">
            <div className="font-medium mb-1">Source (Journal/Publisher)</div>
            <input className="w-full border rounded-md p-2" value={source} onChange={e => setSource(e.target.value)} />
          </label>

          <label className="text-sm">
            <div className="font-medium mb-1">DOI</div>
            <input className="w-full border rounded-md p-2" value={doi} onChange={e => setDoi(e.target.value)} />
          </label>

          <label className="text-sm">
            <div className="font-medium mb-1">URL</div>
            <input className="w-full border rounded-md p-2" value={url} onChange={e => setUrl(e.target.value)} />
          </label>

          <label className="text-sm">
            <div className="font-medium mb-1">Bucket</div>
            <select className="w-full border rounded-md p-2" value={bucket} onChange={e => setBucket(e.target.value)}>
              <option value="Mega">Mega</option>
              <option value="Macro">Macro</option>
              <option value="Micro">Micro</option>
            </select>
          </label>

          <label className="text-sm md:col-span-2">
            <div className="font-medium mb-1">Authors (Last, First; Last, First)</div>
            <input className="w-full border rounded-md p-2" value={authorsRaw} onChange={e => setAuthorsRaw(e.target.value)} />
          </label>

          <label className="text-sm md:col-span-2">
            <div className="font-medium mb-1">Tags (comma separated)</div>
            <input className="w-full border rounded-md p-2" value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} />
          </label>

          <label className="text-sm md:col-span-2">
            <div className="font-medium mb-1">Notes</div>
            <textarea className="w-full border rounded-md p-2 min-h-[100px]" value={notes} onChange={e => setNotes(e.target.value)} />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-slate-900 text-white disabled:opacity-60">
            {loading ? 'Saving…' : 'Add Item'}
          </button>
          {status && <div className="text-sm text-slate-700">{status}</div>}
        </div>
      </form>

      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Current Items</h2>
          <button onClick={loadItems} className="text-sm underline">Refresh</button>
        </div>

        {items.length === 0 ? (
          <div className="text-slate-600">No items yet.</div>
        ) : (
          <ul className="space-y-3">
            {items.map(it => (
              <li key={it.id} className="border rounded-lg p-3 flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm text-slate-600">
                    {it.year || '—'} · {it.item_type || '—'} · {it.bucket || '—'}
                  </div>
                </div>
                <button onClick={() => deleteItem(it.id)} className="text-sm text-red-700 underline">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
