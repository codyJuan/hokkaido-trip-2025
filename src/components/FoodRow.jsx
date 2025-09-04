// src/components/FoodRow.jsx
import { useRef, useState, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import ImageSmart from "./ImageSmart.jsx";

/* GitHub Pages base-path 處理（fallback 用） */
function resolveAsset(url) {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

/* 把 imagesMeta 裡的 src 也補上 base-path（給 ImageSmart 用） */
function resolveMeta(meta) {
  if (!meta) return undefined;
  const mapBucket = (arr = []) => arr.map((x) => ({ ...x, src: resolveAsset(x.src) }));
  return {
    ...meta,
    fallback: resolveAsset(meta.fallback),
    sources: {
      avif: mapBucket(meta.sources?.avif),
      webp: mapBucket(meta.sources?.webp),
      jpeg: mapBucket(meta.sources?.jpeg),
    },
  };
}

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
        /* === 手機：1 欄滿版；≥sm：自適應網格 === */
        <div
          className="
            grid gap-5
            grid-cols-1
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

function FoodCard({ item, mode = "grid" }) {
  const images = useMemo(
    () => (Array.isArray(item.images) ? item.images : item.image ? [item.image] : []).map(resolveAsset),
    [item.images, item.image]
  );
  const metas = useMemo(
    () => (Array.isArray(item.imagesMeta) ? item.imagesMeta : []).map(resolveMeta),
    [item.imagesMeta]
  );

  const [current, setCurrent] = useState(0);

  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    initial: 0,
    slideChanged(s) {
      setCurrent(s.track.details.rel);
    },
  });

  const sizeClass =
    mode === "row"
      ? "min-w-[220px] sm:min-w-[240px] md:min-w-[260px] max-w-[280px]"
      : "w-full";

  const hasMulti = images.length > 1;

  return (
    <article
      className={`${sizeClass} rounded-2xl overflow-hidden border bg-white shadow-card hover:shadow-md transition`}
    >
      {/* 封面：1:1，內用 Keen Slider；優先 ImageSmart，無 meta 則 fallback <img> */}
      <div className="relative">
        <div className="aspect-square bg-gray-100">
          <div ref={sliderRef} className="keen-slider h-full">
            {images.map((src, i) => (
              <div key={i} className="keen-slider__slide flex items-center justify-center">
                <div className="relative w-full h-full">
                  {metas[i] ? (
                    <ImageSmart
                      meta={metas[i]}
                      alt={item.title || ""}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  ) : (
                    <img
                      src={src}
                      alt={item.title || ""}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

{hasMulti && (
  <>
    {/* 左右切換（Heroicons） */}
    <button
      onClick={() => slider.current?.prev()}
      className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center
                 h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
      aria-label="previous image"
    >
      <ChevronLeftIcon className="h-5 w-5" />
    </button>
    <button
      onClick={() => slider.current?.next()}
      className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center
                 h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
      aria-label="next image"
    >
      <ChevronRightIcon className="h-5 w-5" />
    </button>

    {/* 右下角：目前第幾張 */}
    <div
      className="absolute right-2 bottom-2 rounded-full bg-black/60 text-white
                 px-3 py-1 text-xs font-medium select-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {current + 1}/{images.length}
    </div>
  </>
)}
      </div>

      {/* 文字內容 */}
      <div className="p-3">
        {/* 標題：手機單行 truncate；📍緊貼在標題後、可點 map */}
        <h3 className="font-semibold text-base leading-tight truncate" title={item.title}>
          {item.title || "Untitled"}
          {item.mapUrl && (
            <a
              href={item.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block ml-0.5 text-blue-600 hover:text-blue-800"
              aria-label="Open in Google Maps"
              onClick={(e) => e.stopPropagation()}
              title="Open in Google Maps"
            >
              📍
            </a>
          )}
        </h3>

        {item.note && <div className="text-sm text-gray-600 line-clamp-2 mt-1">{item.note}</div>}
        {item.rating != null && <div className="text-sm mt-2">⭐ {Number(item.rating).toFixed(1)}</div>}
      </div>
    </article>
  );
}