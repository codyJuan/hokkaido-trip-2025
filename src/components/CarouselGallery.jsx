import { useRef } from "react";

export default function CarouselGallery({ images = [] }) {
  const ref = useRef(null);
  const next = () => shift(1);
  const prev = () => shift(-1);

  function shift(dir) {
    if (!ref.current) return;
    const box = ref.current;
    const w = box.clientWidth;
    box.scrollBy({ left: dir * w, behavior: "smooth" });
  }

  return (
    <section className="my-12">
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-xl sm:text-2xl font-semibold">Carousel Gallery</h2>
        <div className="hidden md:flex gap-2">
          <button onClick={prev} className="px-3 py-1 rounded-lg border">◀</button>
          <button onClick={next} className="px-3 py-1 rounded-lg border">▶</button>
        </div>
      </div>

      <div ref={ref} className="hide-scrollbar flex overflow-x-auto gap-4 scroll-smooth">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            className="w-[85vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] h-64 sm:h-72 md:h-80 object-cover rounded-2xl shadow-card"
          />
        ))}
      </div>
    </section>
  );
}