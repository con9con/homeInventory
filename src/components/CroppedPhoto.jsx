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

  // Use background-image so percentage positioning works correctly for any image aspect ratio.
  // background-size X% auto scales the image so the crop width = container width.
  // background-position percentages correctly map the crop region to the container edges.
  const bgSizeW = (100 / crop.width) * 100;
  const bgPosX = crop.width >= 100 ? 0 : (crop.x / (100 - crop.width)) * 100;
  const bgPosY = crop.height >= 100 ? 0 : (crop.y / (100 - crop.height)) * 100;

  return (
    <div
      className={className}
      style={{
        backgroundImage: `url(${url})`,
        backgroundSize: `${bgSizeW}% auto`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        backgroundRepeat: 'no-repeat',
        ...style,
      }}
    />
  );
}
