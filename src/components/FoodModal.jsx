import { useEffect, useMemo, useState } from "react";

// 讓 /images/... 在 GitHub Pages（有 repo base）也能正確載入
function resolveAsset(url) {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

export default function FoodModal({ open, onClose, item }) {
  const images = useMemo(() => {
    if (!item) return [];
    if (Array.isArray(item.images) && item.images.length) return item.images;
    if (item.image) return [item.image];
    return [];
  }, [item]);

  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [item]);

  // ESC 關閉
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open || !item) return null;

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* 本體：限制最大高度，圖片區+文字區分開，確保標題不會被擠掉 */}
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden
                   max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* === 圖片區（正方形），大小自適應：min(90vw, 60vh) === */}
        <div className="relative flex-none flex items-center justify-center bg-black">
          <div
            className="relative"
            style={{
              width: "min(90vw, 60vh)",
              height: "min(90vw, 60vh)", // 正方形
            }}
          >
            {images[idx] && (
              <img
                src={resolveAsset(images[idx])}
                alt={item.title || ""}
                className="absolute inset-0 w-full h-full object-cover object-center select-none"
                draggable="false"
              />
            )}

            {/* 左右切換 */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-white/85 border"
                  aria-label="Previous photo"
                >
                  ◀
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-white/85 border"
                  aria-label="Next photo"
                >
                  ▶
                </button>
              </>
            )}
          </div>
        </div>

        {/* === 文字 + 縮圖（可捲動），一定可見 === */}
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-lg font-semibold">{item.title || "Untitled"}</h3>
          {item.note && <p className="text-sm text-gray-600 mt-1">{item.note}</p>}
          {item.rating != null && (
            <p className="text-sm mt-2">⭐ {Number(item.rating).toFixed(1)}</p>
          )}

          {images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-20 w-20 rounded-lg overflow-hidden border ${
                    i === idx ? "ring-2 ring-black" : ""
                  }`}
                  aria-label={`Thumbnail ${i + 1}`}
                >
                  <img
                    src={resolveAsset(src)}
                    className="h-full w-full object-cover object-center"
                    alt=""
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}