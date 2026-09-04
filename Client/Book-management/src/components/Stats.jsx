import React from "react";
import { BookOpen, DollarSign, Tag, Heart, Award } from "lucide-react";

const Stats = ({ books }) => {
  if (!books || books.length === 0) return null;

  const totalBooks = books.length;
  const totalValue = books.reduce(
    (sum, b) => sum + (Number(b.bookPrice) || 0),
    0,
  );
  const avgPrice = totalValue / totalBooks;
  const favoritesCount = books.filter((b) => b.isFavorite).length;

  const genreCounts = books.reduce((acc, b) => {
    const genre = b.genre || "Uncategorized";
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});

  const [topGenre, maxCount] = Object.entries(genreCounts).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    ["N/A", 0],
  );

  const STAT_ITEMS = [
    {
      id: "total",
      label: "COLLECTION SIZE",
      value: `${totalBooks} ${totalBooks === 1 ? "BOOK" : "BOOKS"}`,
      subtext: "Total items in library",
      icon: <BookOpen className="w-5 h-5 text-black stroke-2.5" />,
      badgeBg: "bg-[#FFDE59]",
    },
    {
      id: "value",
      label: "VALUATION TOTAL",
      value: `$${totalValue.toFixed(2)}`,
      subtext: `Avg $${avgPrice.toFixed(2)} / book`,
      icon: <DollarSign className="w-5 h-5 text-black stroke-2.5" />,
      badgeBg: "bg-[#CCFF00]",
    },
    {
      id: "top-genre",
      label: "TOP CATEGORY",
      value: topGenre.toUpperCase(),
      subtext: `${maxCount} ${maxCount === 1 ? "title" : "titles"} stored`,
      icon: <Tag className="w-5 h-5 text-black stroke-2.5" />,
      badgeBg: "bg-[#00E5FF]",
    },
    {
      id: "favorites",
      label: "FAVORITES",
      value: `${favoritesCount} SAVED`,
      subtext: "Bookmarked titles",
      icon: <Heart className="w-5 h-5 text-white fill-white stroke-2.5" />,
      badgeBg: "bg-[#FF4D4D]",
    },
  ];

  return (
    <section className="mt-12" aria-label="Collection Statistics">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-[#FFDE59] border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000]">
          <Award className="w-5 h-5 text-black stroke-2.5" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight">
          COLLECTION INSIGHTS
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STAT_ITEMS.map((stat) => (
          <article
            key={stat.id}
            className="nb-card nb-card-hover flex flex-col justify-between p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <span className="text-xs font-black uppercase tracking-wider opacity-75">
                {stat.label}
              </span>
              <div
                className={`w-10 h-10 border-2 border-black rounded-lg ${stat.badgeBg} shrink-0 flex items-center justify-center shadow-[2px_2px_0px_0px_#000]`}
              >
                {stat.icon}
              </div>
            </div>

            <div>
              <div className="text-2xl font-black tracking-tight mb-1 truncate">
                {stat.value}
              </div>
              <p className="text-xs font-bold opacity-65 truncate">
                {stat.subtext}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Stats;
