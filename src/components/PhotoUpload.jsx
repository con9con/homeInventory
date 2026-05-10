import { useRef, useState } from 'react';

async function uploadFile(file) {
  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: file.name, type: file.type, data }),
  });
  if (!res.ok) throw new Error('Upload failed');
  const { url } = await res.json();
  return url;
}

export default function PhotoUpload({ photos, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e) {
    const files = Array.from(e.target.files);
    e.target.value = '';
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      onChange([...photos, ...urls]);
    } finally {
      setUploading(false);
    }
  }

  function remove(index) {
    onChange(photos.filter((_, i) => i !== index));
  }

  function setFeatured(index) {
    const next = [...photos];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {photos.map((src, i) => (
          <div key={src} className="relative w-20 h-20 group">
            <img
              src={src}
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
            {i !== 0 && (
              <button
                type="button"
                onClick={() => setFeatured(i)}
                title="Set as featured"
                className="absolute bottom-0 left-0 right-0 bg-black/60 text-yellow-300 text-[10px] font-semibold text-center leading-4 rounded-b opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ★ Feature
              </button>
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
            >
              ×
            </button>
          </div>
        ))}
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
  );
}
