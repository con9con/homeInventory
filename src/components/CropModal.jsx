import { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

async function getCroppedBlob(imgEl, crop) {
  const canvas = document.createElement('canvas');
  const scaleX = imgEl.naturalWidth / imgEl.width;
  const scaleY = imgEl.naturalHeight / imgEl.height;
  canvas.width = Math.round(crop.width * scaleX);
  canvas.height = Math.round(crop.height * scaleY);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    imgEl,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
}

export default function CropModal({ src, filename, onConfirm, onCancel }) {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();

  const onImageLoad = useCallback(e => {
    const { width, height } = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, undefined, width, height),
      width,
      height,
    );
    setCrop(initial);
    setCompletedCrop(initial);
  }, []);

  async function handleConfirm() {
    if (!completedCrop || !imgRef.current) return;
    const px = {
      x: (completedCrop.x / 100) * imgRef.current.width,
      y: (completedCrop.y / 100) * imgRef.current.height,
      width: (completedCrop.width / 100) * imgRef.current.width,
      height: (completedCrop.height / 100) * imgRef.current.height,
    };
    const blob = await getCroppedBlob(imgRef.current, px);
    onConfirm(blob, filename);
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <ReactCrop
          crop={crop}
          onChange={setCrop}
          onComplete={setCompletedCrop}
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
