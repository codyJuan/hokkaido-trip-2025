// src/components/ImageSmart.jsx
export default function ImageSmart({
  meta,        // 由 gen-data 產出的 { fallback, sources:{avif,webp,jpeg}, sizes }
  alt = "",
  className = "",
  loading = "lazy",
}) {
  if (!meta || !meta.fallback) {
    return <img alt={alt} className={className} loading={loading} />;
  }

  // 將 [{src, w}] 轉成 "url 400w, url 800w"
  const toSrcSet = (arr = []) =>
    arr
      .filter(Boolean)
      .map((o) => (o.w ? `${o.src} ${o.w}w` : `${o.src}`))
      .join(", ");

  const avif = toSrcSet(meta.sources?.avif);
  const webp = toSrcSet(meta.sources?.webp);
  const jpeg = toSrcSet(meta.sources?.jpeg);

  return (
    <picture>
      {avif && <source srcSet={avif} type="image/avif" sizes={meta.sizes} />}
      {webp && <source srcSet={webp} type="image/webp" sizes={meta.sizes} />}
      {jpeg && <source srcSet={jpeg} type="image/jpeg" sizes={meta.sizes} />}
      <img src={meta.fallback} alt={alt} className={className} loading={loading} />
    </picture>
  );
}