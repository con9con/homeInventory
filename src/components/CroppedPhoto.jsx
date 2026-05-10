// Handles both legacy string URLs and new {url, crop} objects
export function normalizePhoto(p) {
  return typeof p === 'string' ? { url: p, crop: null } : p;
}

export default function CroppedPhoto({ photo, className, style }) {
  const { url, crop } = normalizePhoto(photo);
  const imgStyle = crop
    ? {
        objectFit: 'cover',
        objectPosition: `${crop.x + crop.width / 2}% ${crop.y + crop.height / 2}%`,
        ...style,
      }
    : { objectFit: 'cover', ...style };
  return <img src={url} className={className} style={imgStyle} />;
}
