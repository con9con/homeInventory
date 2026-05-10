import { useRef, useState } from 'react';
import CropModal from './CropModal';
import { normalizePhoto } from './CroppedPhoto';

async function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadOriginal(file, getToken) {
  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const token = await getToken();
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name: file.name, type: file.type, data }),
  });
  if (!res.ok) throw new Error('Upload failed');
  const { url } = await res.json();
  return url;
}

export default function PhotoUpload({ photos, onChange, getToken }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  // Each queue item: { src, initialCrop, existingIndex, uploadPromise }
  const [cropQueue, setCropQueue] = useState([]);

  async function handleFiles(e) {
    const files = Array.from(e.target.files);
    e.target.value = '';
    const items = await Promise.all(
      files.map(async f => ({
        src: await readAsDataURL(f),
        initialCrop: null,
        existingIndex: null,
        uploadPromise: uploadOriginal(f, getToken),
      }))
    );
    setCropQueue(q => [...q, ...items]);
  }

  async function handleCropConfirm(cropPct) {
    const { existingIndex, uploadPromise } = cropQueue[0];
    setCropQueue(q => q.slice(1));

    if (existingIndex !== null) {
      // Re-crop: just update crop params, no new upload
      const next = photos.map((p, i) =>
        i === existingIndex ? { ...normalizePhoto(p), crop: cropPct } : p
      );
      onChange(next);
      return;
    }

    // New photo: wait for upload to finish
    setUploading(true);
    try {
      const url = await uploadPromise;
      onChange([...photos, { url, crop: cropPct }]);
    } finally {
      setUploading(false);
    }
  }

  function handleCropCancel() {
    setCropQueue(q => q.slice(1));
  }

  function remove(index) {
    onChange(photos.filter((_, i) => i !== index));
  }

  function setFeatured(index) {
    const next = [...photos];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  }

  function startRecrop(index) {
    const { url, crop } = normalizePhoto(photos[index]);
    setCropQueue(q => [...q, { src: url, initialCrop: crop, existingIndex: index, uploadPromise: null }]);
  }

  return (
    <>
      {cropQueue.length > 0 && (
        <CropModal
          src={cropQueue[0].src}
          initialCrop={cropQueue[0].initialCrop}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {photos.map((p, i) => {
            const { url } = normalizePhoto(p);
            return (
              <div key={url + i} className="relative w-20 h-20 group">
                <img
                  src={url}
                  alt={`photo ${i + 1}`}
                  className={`w-20 h-20 object-cover rounded border-2 ${
                    i === 0 ? 'border-yellow-400' : 'border-gray-200'
                  }`}
                />
                {i === 0 && photos.length > 1 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-semibold text-center leading-4 rounded-b">
                    Featured
                  </span>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => startRecrop(i)}
                    className="text-white text-[10px] font-medium hover:underline"
                  >
                    Re-crop
                  </button>
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => setFeatured(i)}
                      className="text-yellow-300 text-[10px] font-medium hover:underline"
                    >
                      ★ Feature
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
                >
                  ×
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="text-xs">Uploading…</span>
            ) : (
              <>
                <span className="text-2xl leading-none">+</span>
                <span className="text-xs mt-1">Add photo</span>
              </>
            )}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>
    </>
  );
}
