import { useState } from 'react';
import { loadItems, saveItems } from '../utils/storage';

export function useInventory() {
  const [items, setItems] = useState(() => loadItems());

  function persist(next) {
    setItems(next);
    saveItems(next);
  }

  function addItem(data) {
    const item = {
      ...data,
      id: crypto.randomUUID(),
      dateAdded: data.dateAdded || new Date().toISOString().slice(0, 10),
    };
    persist([item, ...items]);
  }

  function updateItem(id, data) {
    persist(items.map(i => (i.id === id ? { ...i, ...data } : i)));
  }

  function deleteItem(id) {
    persist(items.filter(i => i.id !== id));
  }

  return { items, addItem, updateItem, deleteItem };
}
