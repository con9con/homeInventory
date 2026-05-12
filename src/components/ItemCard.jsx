import { useState } from 'react';
import CroppedPhoto from './CroppedPhoto';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function ItemCard({ item, onEdit, onDelete, onView }) {
  const thumb = item.photos?.[0] ?? null;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div onClick={onView} className="cursor-pointer flex flex-col flex-1">
        <div className="w-full aspect-square bg-white relative overflow-hidden">
          {thumb ? (
            <CroppedPhoto photo={thumb} className="w-full h-full" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-300 text-5xl select-none">📦</span>
            </div>
          )}

          {/* Kebab menu */}
          <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center text-base leading-none opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity [@media(hover:none)]:opacity-100"
              aria-label="Item options"
            >
              ⋮
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-36 z-20">
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(item); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(item.id); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col gap-1 flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{item.brand}</p>
          <p className="font-semibold text-gray-800 leading-snug">{item.model}</p>
          <p className="text-blue-600 font-medium text-sm">{fmt.format(item.price)}</p>
          {item.category && (
            <div className="mt-auto pt-2 flex justify-end">
              <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 truncate max-w-full">
                {item.category}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
