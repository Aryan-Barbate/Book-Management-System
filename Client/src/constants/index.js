export const GENRES = [
  "Fiction",
  "Classic",
  "Sci-Fi",
  "Dystopian",
  "Romance",
  "Mystery",
  "Non-Fiction",
  "Fantasy",
  "Biography",
  "Philosophy",
];

export const GENRE_FILTERS = ["All", "Favorites", ...GENRES];

export const DEFAULT_SHELVES = [
  "Want to Read",
  "Currently Reading",
  "Read",
  "Favorites",
];

export const SHELF_FILTERS = ["All Shelves", ...DEFAULT_SHELVES];

export const POPULAR_TAGS = [
  "Must-Read",
  "Bestseller",
  "Mindset",
  "Sci-Fi",
  "Classic",
  "Non-Fiction",
  "Productivity",
  "Philosophy",
  "Quick Read",
  "Masterpiece",
];

export const GENRE_COLORS = {
  Fiction: "bg-[#FFDE59] text-black",
  Classic: "bg-[#FFDE59] text-black",
  "Sci-Fi": "bg-[#00E5FF] text-black",
  Dystopian: "bg-[#B197FC] text-black",
  Romance: "bg-[#FF66C4] text-black",
  Mystery: "bg-[#FF914D] text-black",
  "Non-Fiction": "bg-[#CCFF00] text-black",
  Fantasy: "bg-[#B197FC] text-black",
  Biography: "bg-[#38EF7D] text-black",
  Philosophy: "bg-[#FFDE59] text-black",
  Favorites: "bg-[#FF4D4D] text-white",
  default: "bg-[#FFDE59] text-black",
};

export const getGenreColor = (genre, isSelected = false) => {
  if (!isSelected) return "bg-white text-black hover:bg-[#FFDE59]";
  return GENRE_COLORS[genre] || GENRE_COLORS.default;
};

export const GENRE_BADGE_CLASSES = {
  Fiction: "nb-badge-yellow",
  Classic: "nb-badge-yellow",
  "Sci-Fi": "nb-badge-cyan",
  Dystopian: "nb-badge-purple",
  Romance: "nb-badge-pink",
  Mystery: "nb-badge-orange",
  "Non-Fiction": "nb-badge-lime",
  Fantasy: "nb-badge-purple",
  Biography: "nb-badge-lime",
  Philosophy: "nb-badge-yellow",
  default: "nb-badge-white",
};

export const getGenreBadgeClass = (genre) => {
  return GENRE_BADGE_CLASSES[genre] || GENRE_BADGE_CLASSES.default;
};

export const SHELF_COLORS = {
  "Want to Read": "bg-[#00E5FF] text-black",
  "Currently Reading": "bg-[#FFDE59] text-black",
  Read: "bg-[#CCFF00] text-black",
  Favorites: "bg-[#FF4D4D] text-white",
};

export const getShelfBadgeClass = (shelf) => {
  switch (shelf) {
    case "Currently Reading":
      return "nb-badge-yellow";
    case "Read":
      return "nb-badge-lime";
    case "Favorites":
      return "nb-badge-pink";
    case "Want to Read":
    default:
      return "nb-badge-cyan";
  }
};
