// src/components/HorizontalRow.jsx
import { useRef, useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import ImageSmart from "./ImageSmart";

/* GitHub Pages base 路徑處理（給 fallback 用） */
function resolveAsset(url) {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

/* 把 imagesMeta 裡的 src 也補上 base-path */
function resolveMeta(meta) {
  if (!meta) return undefined;
  const mapBucket = (arr = []) => (arr || []).map((x) => ({ ...x, src: resolveAsset(x.src) }));
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

export default function HorizontalRow({ title, subtitle, items = [], onCardClick }) {
  const ref = useRef(null);
  const scroll = (dx) => ref.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <section className="my-12">
      {/* 標題區 */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll(-520)}
            className="h-9 w-9 rounded-full border flex items-center justify-center hover:bg-gray-50"
            aria-label="scroll left"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll(520)}
            className="h-9 w-9 rounded-full border flex items-center justify-center hover:bg-gray-50"
            aria-label="scroll right"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 列本體 */}
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

function SpotCard({ item, onOpen }) {
  // 圖片 & meta（處理 base-path）
  const images = useMemo(() => {
    const arr = Array.isArray(item.images) && item.images.length ? item.images : [item.image].filter(Boolean);
    return arr.map(resolveAsset);
  }, [item.images, item.image]);

  const metas = useMemo(() => {
    const arr = Array.isArray(item.imagesMeta) ? item.imagesMeta : [];
    return arr.map(resolveMeta);
  }, [item.imagesMeta]);

  const parsedMedia = images.map((src, i) => ({
    type: "image",
    src,
    meta: metas[i],
  }));

  const hasMultiple = parsedMedia.length > 1;
  const [current, setCurrent] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1, spacing: 0 },
    slideChanged(s) {
      setCurrent(s.track.details.rel);
    },
  });

  return (
    <article
      className={[
        "min-w-[240px] sm:min-w-[280px]",
        "lg:min-w-[360px] xl:min-w-[420px] 2xl:min-w-[480px]",
        "max-w-[560px] w-full rounded-2xl overflow-hidden border bg-white",
        "shadow-card hover:shadow-md transition",
      ].join(" ")}
    >
      {/* 4:3 封面區（keen-slider） */}
      <div className="relative select-none">
        <div ref={sliderRef} className="keen-slider aspect-[4/3] bg-gray-100">
          {parsedMedia.map((m, i) => (
            <div key={i} className="keen-slider__slide">
              {/* ImageSmart 會自動用 <picture/srcset>；沒有 meta 就 fallback <img> */}
              {m.meta ? (
                <ImageSmart
                  meta={m.meta}
                  alt={item.nameEn || item.nameZh || ""}
                  className="w-full h-full object-cover object-center cursor-pointer"
                  onClick={onOpen}
                />
              ) : (
                <img
                  src={m.src}
                  alt={item.nameEn || item.nameZh || ""}
                  className="w-full h-full object-cover object-center cursor-pointer"
                  loading="lazy"
                  onClick={onOpen}
                />
              )}
            </div>
          ))}
        </div>

        {hasMultiple && (
          <>
            {/* 左右切換 */}
            <button
              onClick={(e) => { e.stopPropagation(); instanceRef.current?.prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center
                         h-9 w-9 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
              aria-label="previous image"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); instanceRef.current?.next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center
                         h-9 w-9 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
              aria-label="next image"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>

            {/* 圓點指示 */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {parsedMedia.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); instanceRef.current?.moveToIdx(i); }}
                  className={`h-1.5 w-1.5 rounded-full ${i === current ? "bg-white" : "bg-white/60"}`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 文字區 */}
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