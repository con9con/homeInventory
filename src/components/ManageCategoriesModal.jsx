import { useState } from 'react';

export default function ManageCategoriesModal({ categories, onAdd, onDelete, onClose }) {
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  async function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!name.trim()) return;
    setAdding(true);
    setError('');
    const err = await onAdd(name.trim());
    if (err) setError(err);
    else setName('');
    setAdding(false);
  }

  async function handleDelete(cat) {
    setDeletingId(cat.id);
    setError('');
    const err = await onDelete(cat.id);
    if (err) setError(err);
    setDeletingId(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Manage Categories</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="px-5 py-4 max-h-72 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No categories yet.</p>
          ) : (
            <ul className="space-y-1">
              {categories.map(cat => (
                <li key={cat.id} className="flex items-center justify-between gap-2 py-1">
                  <span className="text-sm text-gray-700">{cat.name}</span>
                  <button
                    onClick={() => handleDelete(cat)}
                    disabled={deletingId === cat.id}
                    className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40 shrink-0"
                  >
                    {deletingId === cat.id ? 'Deleting…' : 'Delete'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="New category name"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
            <button
              type="submit"
              disabled={adding || !name.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
