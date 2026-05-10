import { useState, useMemo } from 'react';
import { useInventory } from './hooks/useInventory';
import ItemList from './components/ItemList';
import ItemFormModal from './components/ItemFormModal';

export default function App() {
  const { items, addItem, updateItem, deleteItem } = useInventory();
  const [modalItem, setModalItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
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

  function openAdd() {
    setModalItem(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setModalItem(item);
    setModalOpen(true);
  }

  function handleSave(data) {
    if (modalItem) {
      updateItem(modalItem.id, data);
    } else {
      addItem(data);
    }
    setModalOpen(false);
  }

  function handleDelete(id) {
    if (confirm('Delete this item?')) deleteItem(id);
  }

  function toggleCategory(cat) {
    setActiveCategory(prev => (prev === cat ? '' : cat));
  }

  const isFiltered = !!query.trim() || !!activeCategory;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🏠</span>
            <span className="text-xl font-bold text-gray-800">Home Inventory</span>
          </div>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by brand or model…"
            className="flex-1 max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
          />
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0 ml-auto"
          >
            + Add Item
          </button>
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
        <p className="text-sm text-gray-400 mb-6">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
          {activeCategory && ` in ${activeCategory}`}
          {query.trim() && ` matching "${query}"`}
        </p>
        <ItemList items={filtered} onEdit={openEdit} onDelete={handleDelete} isFiltered={isFiltered} />
      </main>

      {modalOpen && (
        <ItemFormModal
          item={modalItem}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
