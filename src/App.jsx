import { useState } from 'react';
import { useInventory } from './hooks/useInventory';
import ItemList from './components/ItemList';
import ItemFormModal from './components/ItemFormModal';

export default function App() {
  const { items, addItem, updateItem, deleteItem } = useInventory();
  const [modalItem, setModalItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? items.filter(i =>
        `${i.brand} ${i.model} ${i.category ?? ''}`.toLowerCase().includes(query.toLowerCase())
      )
    : items;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
          >
            + Add Item
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-400">
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            {query.trim() && ` for "${query}"`}
          </p>
        </div>
        <ItemList items={filtered} onEdit={openEdit} onDelete={handleDelete} isFiltered={!!query.trim()} />
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
