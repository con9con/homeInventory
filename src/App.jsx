import { useState } from 'react';
import { useInventory } from './hooks/useInventory';
import ItemList from './components/ItemList';
import ItemFormModal from './components/ItemFormModal';

export default function App() {
  const { items, addItem, updateItem, deleteItem } = useInventory();
  const [modalItem, setModalItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="text-xl font-bold text-gray-800">Home Inventory</span>
          </div>
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Add Item
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-400">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <ItemList items={items} onEdit={openEdit} onDelete={handleDelete} />
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
