// src/components/FoodMasonry.jsx
export default function FoodMasonry({ title = "Food Highlights", items = [] }) {
  return (
    <section className="my-12">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">{title}</h2>

      <div className="columns-2 md:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
        {items.map((f) => (
          <figure
            key={f.id}
            className="break-inside-avoid mb-4 rounded-2xl overflow-hidden border bg-white shadow-card"
          >
            <div className="relative">
              <img src={f.image} alt={f.title} className="w-full object-cover" />
              {f.rating && (
                <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-white/90 border">
                  ⭐ {Number(f.rating).toFixed(1)}
                </span>
              )}
            </div>
            <figcaption className="p-3">
              <div className="font-semibold">{f.title}</div>
              {f.note && <div className="text-sm text-gray-600 mt-1">{f.note}</div>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}