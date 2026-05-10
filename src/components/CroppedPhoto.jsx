// Handles both legacy string URLs and new {url, crop} objects
export function normalizePhoto(p) {
  return typeof p === 'string' ? { url: p, crop: null } : p;
}

// Renders a photo with its crop region filling the container.
// crop: { x, y, width, height } as percentages of the displayed image dimensions.
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

  // Scale the image so the crop region exactly fills the container, then offset it.
  // All percentages are relative to the container dimensions.
  const scaleW = 100 / crop.width;   // e.g. crop.width=80% → scaleW=1.25
  const scaleH = 100 / crop.height;
  const left = -(crop.x / crop.width) * 100;   // e.g. crop.x=10%, crop.width=80% → left=-12.5%
  const top  = -(crop.y / crop.height) * 100;

  return (
    <div
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      <img
        src={url}
        style={{
          position: 'absolute',
          width:  `${scaleW * 100}%`,
          height: 'auto',
          left:   `${left}%`,
          top:    `${top}%`,
        }}
      />
    </div>
  );
}
