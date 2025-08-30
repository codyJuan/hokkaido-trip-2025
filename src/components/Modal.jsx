import { useEffect, useMemo, useState } from "react";

export default function Modal({ open, onClose, item }) {
  const images = useMemo(() => {
    if (!item) return [];
    return (Array.isArray(item.images) && item.images.length
      ? item.images
      : item.image
      ? [item.image]
      : []
    );
  }, [item]);

  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [item]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open || !item) return null;

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 圖片：等比例縮放、不裁切、置中顯示；高度跟視窗連動 */}
        <div className="relative flex items-center justify-center bg-black/5">
          {images.length > 0 && (
            <img
              src={images[idx]}
              alt={item.nameEn || ""}
              className="block mx-auto w-auto max-w-full h-auto max-h-[66vh] md:max-h-[70vh] object-contain select-none"
              draggable="false"
            />
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-white/80 border"
                aria-label="Previous"
              >
                ◀
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-white/80 border"
                aria-label="Next"
              >
                ▶
              </button>
            </>
          )}
        </div>

        <div className="p-4 overflow-y-auto">
          {/* 名稱 + Google Maps 連結（帶📍icon） */}
          <h3 className="text-xl font-semibold">
            {item.mapUrl ? (
              <a
                href={item.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                <span aria-hidden>📍</span>
                <span>{item.nameEn}</span>
              </a>
            ) : (
              item.nameEn
            )}
          </h3>
          {item.nameZh && <p className="text-gray-500">{item.nameZh}</p>}

          {!!(item.tags && item.tags.length) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full border">
                  {t}
                </span>
              ))}
            </div>
          )}

          {item.blurb && <p className="mt-3 text-gray-700">{item.blurb}</p>}
          {item.rating != null && (
            <p className="mt-2 text-sm text-gray-600">⭐ {Number(item.rating).toFixed(1)}</p>
          )}

          {/* 縮圖列 */}
          {images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-16 w-24 rounded-lg overflow-hidden border ${i === idx ? "ring-2 ring-black" : ""}`}
                  aria-label={`thumbnail ${i + 1}`}
                >
                  <img src={src} className="h-full w-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}