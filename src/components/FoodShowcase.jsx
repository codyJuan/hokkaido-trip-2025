import { useState } from "react";
import FoodModal from "./FoodModal.jsx";

export default function FoodShowcase({ title = "Food Highlights", items = [] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  const openModal = (item) => { setActive(item); setOpen(true); };

  return (
    <section className="my-12">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">{title}</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((f) => (
          <FoodTile key={f.id} item={f} onOpen={() => openModal(f)} />
        ))}
      </div>

      <FoodModal open={open} onClose={() => setOpen(false)} item={active} />
    </section>
  );
}

function resolveAsset(url) {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

function FoodTile({ item, onOpen }) {
  const images = Array.isArray(item.images) && item.images.length ? item.images : (item.image ? [item.image] : []);
  const cover = images[0] || "";

  return (
    <article
      onClick={onOpen}
      className="group rounded-2xl overflow-hidden border bg-white shadow-card hover:shadow-md transition cursor-pointer"
    >
      {/* 1:1 正方形封面 */}
      <div className="aspect-square relative bg-gray-100">
        {cover && (
          <img
            src={resolveAsset(cover)}
            alt={item.title || ""}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {/* 多張提示 */}
        {images.length > 1 && (
          <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full bg-black/70 text-white">
            {images.length} photos
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold">{item.title || "Untitled"}</h3>
        {item.note && <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.note}</p>}
        {item.rating && <div className="text-sm mt-2">⭐ {Number(item.rating).toFixed(1)}</div>}
      </div>
    </article>
  );
}