// src/components/FoodRow.jsx
import { useMemo, useRef, useState } from "react";

export default function FoodRow({
  title = "Food Highlights",
  subtitle = "",
  items = [],
  expandAll = true, // 預設一次展開全部；要橫向列就傳 false
}) {
  const rowRef = useRef(null);
  const scroll = (dx) => rowRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <section className="my-12">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>

        {!expandAll && (
          <div className="hidden md:flex gap-2">
            <button onClick={() => scroll(-360)} className="px-3 py-1 rounded-lg border">◀</button>
            <button onClick={() => scroll(360)} className="px-3 py-1 rounded-lg border">▶</button>
          </div>
        )}
      </div>

      {expandAll ? (
        /* === 展開全部：自適應網格，避免 iPad 黏在一起 === */
        <div
          className="
            grid gap-5
            grid-cols-[repeat(auto-fill,minmax(160px,1fr))]
            sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]
            md:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]
            lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]
            xl:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]
          "
        >
          {items.map((it) => <FoodCard key={it.id} item={it} mode="grid" />)}
        </div>
      ) : (
        /* === 原本橫向模式 === */
        <div ref={rowRef} className="hide-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-1">
          {items.map((it) => <FoodCard key={it.id} item={it} mode="row" />)}
        </div>
      )}
    </section>
  );
}

/* GitHub Pages base-path 處理 */
function resolveAsset(url) {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}
function FoodCard({ item, mode = "grid" }) {
  const images = useMemo(
    () =>
      Array.isArray(item.images) && item.images.length
        ? item.images
        : [item.image].filter(Boolean),
    [item.images, item.image]
  );

  const [idx, setIdx] = useState(0);
  const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); };

  const sizeClass =
    mode === "row"
      ? "min-w-[220px] sm:min-w-[240px] md:min-w-[260px] max-w-[280px]"
      : "w-full";

  return (
    <article
      className={`${sizeClass} rounded-2xl overflow-hidden border bg-white shadow-card hover:shadow-md transition`}
    >
      {/* 封面 */}
      <div className="relative">
        <div className="aspect-square bg-gray-100">
          {images[idx] && (
            <img
              src={resolveAsset(images[idx])}
              alt={item.title || ""}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-white/90 border text-xs shadow"
              aria-label="previous image"
            >◀</button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-white/90 border text-xs shadow"
              aria-label="next image"
            >▶</button>
            <span className="absolute bottom-2 right-2 text-[11px] px-1.5 py-0.5 rounded-full bg-black/70 text-white">
              {idx + 1}/{images.length}
            </span>
          </>
        )}
      </div>

      {/* 文字內容 */}
      <div className="p-3">
        <div className="flex items-center gap-2 font-semibold truncate">
          <span>{item.title || "Untitled"}</span>
          {item.mapUrl && (
            <a
              href={item.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
              aria-label="Open in Google Maps"
              onClick={(e) => e.stopPropagation()} // 防止觸發卡片其他事件
            >
              📍
            </a>
          )}
        </div>

        {item.note && (
          <div className="text-sm text-gray-600 line-clamp-2 mt-1">{item.note}</div>
        )}
        {item.rating != null && (
          <div className="text-sm mt-2">⭐ {Number(item.rating).toFixed(1)}</div>
        )}
      </div>
    </article>
  );
}