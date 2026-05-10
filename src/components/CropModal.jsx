import { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function CropModal({ src, initialCrop, onConfirm, onCancel }) {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCropPct, setCompletedCropPct] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [baseSize, setBaseSize] = useState(null);

  const onImageLoad = useCallback(e => {
    const { width, height } = e.currentTarget;
    setBaseSize({ width, height });
    const pct = initialCrop
      ? { unit: '%', ...initialCrop }
      : centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
    setCrop(pct);
    setCompletedCropPct({ x: pct.x, y: pct.y, width: pct.width, height: pct.height });
  }, [initialCrop]);

  function handleConfirm() {
    if (!completedCropPct?.width) return;
    onConfirm(completedCropPct);
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      {/* Scrollable image area — nested div lets justify-center work without hiding overflow */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full flex items-center justify-center p-4">
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            onComplete={(_, pct) =>
              setCompletedCropPct({ x: pct.x, y: pct.y, width: pct.width, height: pct.height })
            }
            aspect={1}
            ruleOfThirds
          >
            <img
              ref={imgRef}
              src={src}
              alt="Crop preview"
              style={
                baseSize
                  ? { width: `${baseSize.width * zoom}px`, maxWidth: 'none', display: 'block' }
                  : { maxHeight: '70vh', maxWidth: '100%', display: 'block' }
              }
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>
      </div>

      {/* Zoom slider */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-3 flex items-center gap-3">
        <span className="text-gray-400 text-xs w-8">Zoom</span>
        <input
          type="range"
          min={1}
          max={4}
          step={0.05}
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          className="flex-1 accent-blue-500"
        />
        <span className="text-gray-400 text-xs w-10 text-right">{zoom.toFixed(1)}×</span>
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
