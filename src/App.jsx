import { useState } from "react";
import HorizontalRow from "./components/HorizontalRow.jsx";
import Modal from "./components/Modal.jsx";
import CarouselGallery from "./components/CarouselGallery.jsx";
import FriendsEgg from "./components/FriendsEgg.jsx";
import FoodMasonry from "./components/FoodMasonry.jsx";
import FoodShowcase from "./components/FoodShowcase.jsx";
import FoodRow from "./components/FoodRow.jsx";

import {
  toyaSpots,
  otaruSpots,
  sapporoSpots,
  foodItems,
  galleryImages,
  friendsPhotos
} from "./data.js";

export default function App() {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const onCardClick = (it) => {
    setActiveItem(it);
    setOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="container-slim py-3 flex items-center justify-between">
          <div className="font-bold text-lg sm:text-xl">Hokkaido Trip 2025</div>
          <nav className="hidden sm:flex gap-4 text-sm text-gray-600">
            <a href="#toya" className="hover:text-black">Toya</a>
            <a href="#otaru" className="hover:text-black">Otaru</a>
            <a href="#sapporo" className="hover:text-black">Sapporo</a>
            <a href="#food" className="hover:text-black">Food</a>
            <a href="#gallery" className="hover:text-black">Gallery</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container-slim py-10 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-center">Hokkaido Trip 2025</h1>
        <p className="text-center text-gray-500 mt-2">Toya ・ Otaru ・ Sapporo</p>
      </section>

      <main className="container-slim pb-16">
        <div id="toya">
          <HorizontalRow
            title="Toya"
            subtitle="洞爺湖"
            items={toyaSpots}
            onCardClick={onCardClick}
          />
        </div>

        <div id="otaru">
          <HorizontalRow
            title="Otaru"
            subtitle="小樽"
            items={otaruSpots}
            onCardClick={onCardClick}
          />
        </div>

        <div id="sapporo">
          <HorizontalRow
            title="Sapporo"
            subtitle="札幌"
            items={sapporoSpots}
            onCardClick={onCardClick}
          />
        </div>

        {/* Food */}
        {/* <section id="food" className="my-12">
            <FoodMasonry title="Food Highlights" items={foodItems} />
        </section> */}

        <section id="food" className="my-12">
            <FoodRow title="Food Highlights" items={foodItems} expandAll />
        </section>
        {/* <section id="food" className="my-12">
            <FoodShowcase title="Food Highlights" items={foodItems} />
        </section> */}
        {/* <section id="food" className="my-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Food Highlights</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {foodItems.map((f) => (
              <FoodCard key={f.id} {...f} />
            ))}
          </div>
        </section> */}

        {/* Gallery */}
        <div id="gallery">
          <CarouselGallery images={galleryImages} />
        </div>

        {/* Friends */}
        <FriendsEgg photos={friendsPhotos} />
      </main>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)} item={activeItem} />

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container-slim text-sm text-gray-500">
          © 2025 Cody Juan. Built with React & Tailwind.
        </div>
      </footer>
    </div>
  );
}