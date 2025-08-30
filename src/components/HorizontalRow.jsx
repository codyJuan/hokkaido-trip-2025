// src/components/HorizontalRow.jsx
import { useRef, useState, useMemo, useEffect } from "react";

export default function HorizontalRow({ title, subtitle, items = [], onCardClick }) {
  const ref = useRef(null);
  const scroll = (dx) => ref.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <section className="my-12">
      {/* 標題區：簡潔對齊 */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="hidden md:flex gap-2">
          <button onClick={() => scroll(-520)} className="px-3 py-1 rounded-lg border">◀</button>
          <button onClick={() => scroll(520)} className="px-3 py-1 rounded-lg border">▶</button>
        </div>
      </div>

      {/* 列本體：桌機加大間距 */}
      <div
        ref={ref}
        className="hide-scrollbar flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto scroll-smooth pb-1"
      >
        {items.map((it) => (
          <SpotCard key={it.id} item={it} onOpen={() => onCardClick?.(it)} />
        ))}
      </div>
    </section>
  );
}

/* GitHub Pages base 路徑處理 */
function resolveAsset(url) {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

function SpotCard({ item, onOpen }) {
  // 優先 images，其次 image
  const images = useMemo(() => {
    const arr = Array.isArray(item.images) && item.images.length ? item.images : [item.image].filter(Boolean);
    return arr.map(resolveAsset);
  }, [item.images, item.image]);

  const [idx, setIdx] = useState(0);

  const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); };

  // 鍵盤左右鍵支援（聚焦在卡片時）
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev(e);
      if (e.key === "ArrowRight") next(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <article
      className={[
        // 手機/平板正常；桌機放大，和 Food 卡尺寸接近
        "min-w-[240px] sm:min-w-[280px]",
        "lg:min-w-[360px] xl:min-w-[420px] 2xl:min-w-[480px]",
        "max-w-[560px] w-full rounded-2xl overflow-hidden border bg-white",
        "shadow-card hover:shadow-md transition"
      ].join(" ")}
    >
      {/* 嚴格 4:3 封面，保持裁切中心 */}
      <div className="relative select-none">
        <div className="aspect-[4/3] bg-gray-100">
          {images[idx] && (
            <img
              src={images[idx]}
              alt={item.nameEn || item.nameZh || ""}
              className="w-full h-full object-cover object-center"
              draggable="false"
              onClick={onOpen}
            />
          )}
        </div>

        {images.length > 1 && (
          <>
            {/* 左右切換：白色膠囊，簡潔不遮擋 */}
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-white/95 border text-xs shadow"
              aria-label="previous image"
            >◀</button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-white/95 border text-xs shadow"
              aria-label="next image"
            >▶</button>

            {/* 底部圓點指示 */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === idx ? "bg-white" : "bg-white/60"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 文字區：桌機字級提升，內距一致 */}
      <button onClick={onOpen} className="block w-full text-left p-3 lg:p-4 hover:bg-gray-50">
        <h3 className="font-semibold text-base lg:text-lg truncate">
          {item.nameEn || item.nameZh || "Untitled"}
        </h3>
        {item.nameZh && <p className="text-sm text-gray-500 mt-1 truncate">{item.nameZh}</p>}

        {!!(item.tags && item.tags.length) && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full border">{t}</span>
            ))}
          </div>
        )}

        {item.blurb && <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.blurb}</p>}
      </button>
    </article>
  );
}