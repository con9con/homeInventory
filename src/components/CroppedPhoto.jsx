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

  // CSS `top: X%` uses the containing block's HEIGHT, which can be 0 when `h-full`
  // sits inside an aspect-ratio parent. CSS `margin-top: X%` ALWAYS uses the
  // containing block's WIDTH (per spec), which is always definite. For the square
  // containers CroppedPhoto is used in, width === height so the math is identical.
  //
  // left  = -(crop.x / crop.width)  * 100% of container width  ✓
  // shift up = -(crop.y / crop.height) * container_height
  //          = -(crop.y / crop.height) * container_width  [square container]
  //          → marginTop = -(crop.y / crop.height) * 100% of container width  ✓
  const cropH = crop.height || crop.width; // guard against missing height in old records
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
          marginTop: `${-(crop.y / cropH) * 100}%`,
          left: `${-(crop.x / crop.width) * 100}%`,
          width: `${(100 / crop.width) * 100}%`,
          maxWidth: 'none',
          height: 'auto',
        }}
      />
    </div>
  );
}
