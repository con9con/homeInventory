// Handles both legacy string URLs and new {url, crop} objects
export function normalizePhoto(p) {
  return typeof p === 'string' ? { url: p, crop: null } : p;
}

// Renders a photo with its crop region filling the container.
// crop: { x, y, width, height } as percentages of the image's natural dimensions.
export default function CroppedPhoto({ photo, className, style }) {
  const { url, crop } = normalizePhoto(photo);

  if (!crop) {
    return (
      <img
        src={url}
        className={className}
        style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block', ...style }}
      />
    );
  }

  // Use an <img> (better rendering quality than background-image) with CSS transform.
  // transform: translate(X%, Y%) is relative to the element's own size, so the
  // offset correctly accounts for the image's natural aspect ratio at any zoom level.
  return (
    <div
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      <img
        src={url}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${(100 / crop.width) * 100}%`,
          height: 'auto',
          transform: `translate(-${crop.x}%, -${crop.y}%)`,
        }}
      />
    </div>
  );
}
