import { useState, useEffect } from 'react';
import PhotoUpload from './PhotoUpload';

const today = () => new Date().toISOString().slice(0, 10);

export const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Appliances',
  'Kitchen',
  'Clothing',
  'Tools',
  'Sports & Outdoors',
  'Office',
  'Garage',
  'Other',
];

const empty = () => ({
  brand: '',
  model: '',
  category: '',
  price: '',
  dateAdded: today(),
  photos: [],
});

export default function ItemFormModal({ item, onSave, onClose, getToken }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(item ? { ...item, price: String(item.price) } : empty());
    setErrors({});
  }, [item]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.brand.trim()) e.brand = 'Required';
    if (!form.model.trim()) e.model = 'Required';
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = 'Enter a valid price';
    return e;
  }

  async function submit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try {
      await onSave({ ...form, price: parseFloat(form.price) || 0 });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {item ? 'Edit Item' : 'Add Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <form onSubmit={submit} className="px-6 py-4 space-y-4">
          <Field label="Brand" error={errors.brand}>
            <input
              type="text"
              value={form.brand}
              onChange={e => set('brand', e.target.value)}
              placeholder="e.g. Sony"
              className={input(errors.brand)}
            />
          </Field>
          <Field label="Model" error={errors.model}>
            <input
              type="text"
              value={form.model}
              onChange={e => set('model', e.target.value)}
              placeholder="e.g. WH-1000XM5"
              className={input(errors.model)}
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className={input()}
            >
              <option value="">— Select a category —</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Price" error={errors.price}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="0.00"
                className={input(errors.price) + ' pl-7'}
              />
            </div>
          </Field>
          <Field label="Date Added">
            <input
              type="date"
              value={form.dateAdded}
              onChange={e => set('dateAdded', e.target.value)}
              className={input()}
            />
          </Field>
          <Field label="Photos">
            <PhotoUpload
              photos={form.photos}
              onChange={photos => set('photos', photos)}
              getToken={getToken}
            />
          </Field>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function input(error) {
  return `w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 transition ${
    error
      ? 'border-red-400 focus:ring-red-200'
      : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'
  }`;
}
