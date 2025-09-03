// src/components/ImageSmart.jsx
// 用 <picture> + <source> 自動在 AVIF/WEBP/JPEG 之間選擇，並用 sizes/srcset 做寬度選擇。
// 注意：只把「有 w 的條目」放入 srcset；無 w 的原檔只當 <img src> 的 fallback。

export default function ImageSmart({
  src,          // 傳統單一網址（後備）
  meta,         // { fallback, sizes, sources: { avif:[{src,w?}], webp:[...], jpeg:[...] } }
  alt = "",
  className = "",
  priority = false, // 首屏關鍵圖可以設 true
}) {
  const sizes = meta?.sizes || "(max-width: 768px) 100vw, 50vw";

  const makeSrcSet = (list = []) =>
    list
      .filter((x) => x && x.src && Number.isFinite(x.w)) // 只接受有 w 的 candidate
      .map((x) => `${x.src} ${x.w}w`)
      .join(", ");

  const avifSet = makeSrcSet(meta?.sources?.avif);
  const webpSet = makeSrcSet(meta?.sources?.webp);
  const jpegSet = makeSrcSet(meta?.sources?.jpeg);

  const imgSrc = meta?.fallback || src;

  return (
    <picture>
      {avifSet && <source type="image/avif" srcSet={avifSet} sizes={sizes} />}
      {webpSet && <source type="image/webp" srcSet={webpSet} sizes={sizes} />}
      {jpegSet && <source type="image/jpeg" srcSet={jpegSet} sizes={sizes} />}
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchpriority={priority ? "high" : "auto"}   // 改小寫
      />
    </picture>
  );
}