import { useState, useEffect, useCallback } from 'react';

export function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error('Failed to load items');
      setItems(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addItem(data) {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save item');
    const item = await res.json();
    setItems(prev => [item, ...prev]);
    return item;
  }

  async function updateItem(id, data) {
    const res = await fetch(`/api/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update item');
    const item = await res.json();
    setItems(prev => prev.map(i => (i.id === id ? item : i)));
    return item;
  }

  async function deleteItem(id) {
    const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete item');
    setItems(prev => prev.filter(i => i.id !== id));
  }

  return { items, loading, error, addItem, updateItem, deleteItem };
}
