// src/components/FriendsEgg.jsx
import ImageSmart from "./ImageSmart";

export default function FriendsEgg({ photos = [], photosMeta = [] }) {
  return (
    <section className="my-12">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Friends’ Moments</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((src, i) => (
          <ImageSmart
            key={i}
            src={src}
            meta={photosMeta?.[i]}
            alt={`Friends photo ${i + 1}`}
            className="aspect-square object-cover rounded-2xl shadow-card w-full h-full"
          />
        ))}
      </div>
      {/* <p className="text-gray-500 text-sm mt-3">
        小彩蛋：只在朋友限定頁面顯示的合照💛
      </p> */}
    </section>
  );
}