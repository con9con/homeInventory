import { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function CropModal({ src, initialCrop, onConfirm, onCancel }) {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();

  const onImageLoad = useCallback(e => {
    const { width, height } = e.currentTarget;
    const pct = initialCrop
      ? { unit: '%', ...initialCrop }
      : centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
    setCrop(pct);
    setCompletedCrop({
      unit: 'px',
      x: Math.round((pct.x / 100) * width),
      y: Math.round((pct.y / 100) * height),
      width: Math.round((pct.width / 100) * width),
      height: Math.round((pct.height / 100) * height),
    });
  }, [initialCrop]);

  function handleConfirm() {
    if (!completedCrop?.width || !imgRef.current) return;
    const { width, height } = imgRef.current;
    onConfirm({
      x: completedCrop.x / width * 100,
      y: completedCrop.y / height * 100,
      width: completedCrop.width / width * 100,
      height: completedCrop.height / height * 100,
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <ReactCrop
          crop={crop}
          onChange={setCrop}
          onComplete={setCompletedCrop}
          aspect={1}
          ruleOfThirds
        >
          <img
            ref={imgRef}
            src={src}
            alt="Crop preview"
            style={{ maxHeight: '70vh', maxWidth: '100%' }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>
      <div className="bg-gray-900 px-6 py-4 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg bg-gray-700 text-white text-sm font-medium hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
        >
          Use Photo
        </button>
      </div>
    </div>
  );
}
