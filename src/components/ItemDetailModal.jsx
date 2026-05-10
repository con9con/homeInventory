import { useState } from 'react';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateFmt = date =>
  new Date(date.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export default function ItemDetailModal({ item, onEdit, onDelete, onClose }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = item.photos ?? [];
  const hasPhotos = photos.length > 0;

  function prev() {
    setPhotoIndex(i => (i - 1 + photos.length) % photos.length);
  }
  function next() {
    setPhotoIndex(i => (i + 1) % photos.length);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Photo gallery */}
        <div className="relative w-full aspect-video bg-gray-100 rounded-t-2xl overflow-hidden">
          {hasPhotos ? (
            <>
              <img
                src={photos[photoIndex]}
                alt={`${item.brand} ${item.model} photo ${photoIndex + 1}`}
                className="w-full h-full object-contain"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          i === photoIndex ? 'bg-white' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">
              📦
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="flex gap-2 px-5 pt-3 overflow-x-auto">
            {photos.map((src, i) => (
              <div key={i} className="relative shrink-0">
                <button
                  onClick={() => setPhotoIndex(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors block ${
                    i === photoIndex ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
                {i === 0 && (
                  <span
                    title="Featured photo"
                    className="absolute -top-1 -right-1 text-yellow-400 text-xs leading-none"
                  >
                    ★
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
                {item.brand}
              </p>
              <h2 className="text-xl font-bold text-gray-800">{item.model}</h2>
            </div>
            <p className="text-xl font-semibold text-blue-600 shrink-0">{fmt.format(item.price)}</p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 border-t border-gray-100 pt-4">
            {item.category && (
              <div>
                <span className="text-xs uppercase tracking-wide text-gray-400 block mb-0.5">Category</span>
                <span>{item.category}</span>
              </div>
            )}
            <div>
              <span className="text-xs uppercase tracking-wide text-gray-400 block mb-0.5">Date Added</span>
              <span>{dateFmt(item.dateAdded)}</span>
            </div>
            {hasPhotos && (
              <div>
                <span className="text-xs uppercase tracking-wide text-gray-400 block mb-0.5">Photos</span>
                <span>{photos.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex border-t border-gray-100">
          <button
            onClick={() => { onClose(); onEdit(item); }}
            className="flex-1 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <div className="w-px bg-gray-100" />
          <button
            onClick={() => onDelete(item.id)}
            className="flex-1 py-3 text-sm text-red-400 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
