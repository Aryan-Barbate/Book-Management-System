export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

export const getBookAge = (dateStr) => {
  if (!dateStr) return "";
  const year = new Date(dateStr).getFullYear();
  if (isNaN(year)) return "";
  const diff = new Date().getFullYear() - year;
  return diff <= 0 ? "New Release" : `${diff} yr${diff > 1 ? "s" : ""} old`;
};

export const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.substring(0, 10);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const GENRE_BADGE_CLASSES = {
  Fiction: "nb-badge-yellow",
  Classic: "nb-badge-yellow",
  "Sci-Fi": "nb-badge-cyan",
  Dystopian: "nb-badge-purple",
  Romance: "nb-badge-pink",
  Mystery: "nb-badge-orange",
  "Non-Fiction": "nb-badge-lime",
  default: "nb-badge-white",
};

export const getGenreBadgeClass = (genre) => {
  return GENRE_BADGE_CLASSES[genre] || GENRE_BADGE_CLASSES.default;
};
