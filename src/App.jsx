import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppAuth } from './context/AuthContext';
import { useInventory } from './hooks/useInventory';
import AuthForm from './components/AuthForm';
import ItemList from './components/ItemList';
import ItemFormModal from './components/ItemFormModal';
import ItemDetailModal from './components/ItemDetailModal';
import ManageCategoriesModal from './components/ManageCategoriesModal';

export default function App() {
  const { isSignedIn, user, signOut, getToken } = useAppAuth();

  if (!isSignedIn) return <AuthForm />;

  return <Inventory getToken={getToken} email={user?.email} onSignOut={signOut} />;
}

function Inventory({ getToken, email, onSignOut }) {
  const { items, loading, error, addItem, updateItem, deleteItem } = useInventory(getToken);

  const [modalItem, setModalItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [managingCategories, setManagingCategories] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Categories loaded from the API
  const [categories, setCategories] = useState([]);

  const fetchCategories = useCallback(async () => {
    const token = await getToken();
    const res = await fetch('/api/categories', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) setCategories(await res.json());
  }, [getToken]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  async function addCategory(name) {
    const token = await getToken();
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) return data.error;
    setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    return null;
  }

  async function deleteCategory(id) {
    const token = await getToken();
    const res = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (!res.ok) return data.error;
    setCategories(prev => prev.filter(c => c.id !== id));
    if (activeCategory === categories.find(c => c.id === id)?.name) setActiveCategory('');
    return null;
  }

  const categoryNames = useMemo(() => categories.map(c => c.name), [categories]);

  const usedCategories = useMemo(() => {
    const inUse = new Set(items.map(i => i.category).filter(Boolean));
    return categories.filter(c => inUse.has(c.name));
  }, [categories, items]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const isFiltered = !!query.trim() || !!activeCategory;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Title */}
          <div className="flex items-center gap-2 min-w-0 shrink-0 order-1">
            <span className="text-2xl shrink-0">🏠</span>
            <span className="text-lg font-bold text-gray-800 truncate">Inventory+</span>
          </div>

          {/* Search */}
          <div className="order-3 sm:order-2 w-full sm:flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by brand or model…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="order-2 sm:order-3 flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
            <button
              onClick={openAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Add Item
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-sm font-medium flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                {email?.[0]?.toUpperCase() ?? '?'}
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-48 z-20">
                    <p className="px-3 py-2 text-xs text-gray-400 truncate">{email}</p>
                    <button
                      onClick={() => { setMenuOpen(false); onSignOut(); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 flex-wrap">
          {activeCategory && (
            <button
              onClick={() => setActiveCategory('')}
              className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white font-medium"
            >
              All
            </button>
          )}
          {usedCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.name)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                activeCategory === cat.name
                  ? 'bg-blue-600 border-blue-600 text-white font-medium'
                  : 'border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 bg-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => setManagingCategories(true)}
            className="text-xs px-3 py-1 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            Manage
          </button>
        </div>
      </div>

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
          categories={categoryNames}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          getToken={getToken}
        />
      )}

      {managingCategories && (
        <ManageCategoriesModal
          categories={categories}
          onAdd={addCategory}
          onDelete={deleteCategory}
          onClose={() => setManagingCategories(false)}
        />
      )}
    </div>
  );
}
