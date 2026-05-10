import { useState, useMemo } from 'react';
import { useUser, useStackApp, UserButton } from '@stackframe/stack';
import { useInventory } from './hooks/useInventory';
import ItemList from './components/ItemList';
import ItemFormModal from './components/ItemFormModal';
import ItemDetailModal from './components/ItemDetailModal';

export default function App() {
  const user = useUser();
  const stackApp = useStackApp();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm text-center">
          <span className="text-5xl">🏠</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Home Inventory</h1>
          <p className="text-gray-400 text-sm mb-6">Sign in to manage your inventory.</p>
          <button
            onClick={() => stackApp.redirectToSignIn()}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => stackApp.redirectToSignUp()}
            className="w-full mt-3 border border-gray-200 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Create account
          </button>
        </div>
      </div>
    );
  }

  return <Inventory user={user} />;
}

function Inventory({ user }) {
  const getToken = () => user.getAuthJson().then(j => j?.accessToken ?? null);
  const { items, loading, error, addItem, updateItem, deleteItem } = useInventory(getToken);

  const [modalItem, setModalItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const categories = useMemo(() => {
    const set = new Set(items.map(i => i.category).filter(Boolean));
    return [...set].sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchesSearch = query.trim()
        ? `${i.brand} ${i.model} ${i.category ?? ''}`.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesCategory = activeCategory ? i.category === activeCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [items, query, activeCategory]);

  function openAdd() { setModalItem(null); setModalOpen(true); }
  function openEdit(item) { setModalItem(item); setModalOpen(true); }

  async function handleSave(data) {
    if (modalItem) await updateItem(modalItem.id, data);
    else await addItem(data);
    setModalOpen(false);
  }

  async function handleDelete(id) {
    if (confirm('Delete this item?')) {
      await deleteItem(id);
      setDetailItem(null);
    }
  }

  function toggleCategory(cat) {
    setActiveCategory(prev => (prev === cat ? '' : cat));
  }

  const isFiltered = !!query.trim() || !!activeCategory;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl shrink-0">🏠</span>
              <span className="text-lg font-bold text-gray-800 truncate">Home Inventory</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={openAdd}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + Add Item
              </button>
              <UserButton />
            </div>
          </div>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by brand or model…"
            className="w-full sm:max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
          />
        </div>

        {categories.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 flex gap-2 flex-wrap">
            {activeCategory && (
              <button
                onClick={() => setActiveCategory('')}
                className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white font-medium"
              >
                All
              </button>
            )}
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  activeCategory === cat
                    ? 'bg-blue-600 border-blue-600 text-white font-medium'
                    : 'border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {error ? (
          <div className="text-center py-24 text-red-400">
            <p className="text-lg font-medium">Failed to load items</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
              {activeCategory && ` in ${activeCategory}`}
              {query.trim() && ` matching "${query}"`}
            </p>
            <ItemList items={filtered} onEdit={openEdit} onDelete={handleDelete} onView={setDetailItem} isFiltered={isFiltered} />
          </>
        )}
      </main>

      {detailItem && (
        <ItemDetailModal
          item={detailItem}
          onEdit={openEdit}
          onDelete={handleDelete}
          onClose={() => setDetailItem(null)}
        />
      )}

      {modalOpen && (
        <ItemFormModal
          item={modalItem}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          getToken={getToken}
        />
      )}
    </div>
  );
}
