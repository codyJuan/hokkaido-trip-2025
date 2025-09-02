// src/components/CarouselGallery.jsx
import { useRef } from "react";
import ImageSmart from "./ImageSmart";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

export default function CarouselGallery({ images = [], imagesMeta = [] }) {
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
          <button
            onClick={prev}
            className="h-9 w-9 rounded-full border flex items-center justify-center hover:bg-gray-50"
            aria-label="scroll left"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="h-9 w-9 rounded-full border flex items-center justify-center hover:bg-gray-50"
            aria-label="scroll right"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div ref={ref} className="hide-scrollbar flex overflow-x-auto gap-4 scroll-smooth">
        {images.map((src, i) => (
          <div
            key={i}
            className="
              relative flex-shrink-0 overflow-hidden rounded-2xl shadow-card bg-gray-100
              w-[85vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw]
              aspect-[4/3]
            "
          >
            <ImageSmart
              src={src}
              meta={imagesMeta?.[i]}
              alt={`Gallery image ${i + 1}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}