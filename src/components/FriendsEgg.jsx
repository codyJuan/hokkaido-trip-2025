export default function FriendsEgg({ photos = [] }) {
  return (
    <section className="my-12">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Friends’ Moments</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {photos.map((src, i) => (
          <img
            key={i}
            src={src}
            className="aspect-square object-cover rounded-2xl shadow-card"
          />
        ))}
      </div>
      {/* <p className="text-gray-500 text-sm mt-3">
        小彩蛋：只在朋友限定頁面顯示的合照💛
      </p> */}
    </section>
  );
}