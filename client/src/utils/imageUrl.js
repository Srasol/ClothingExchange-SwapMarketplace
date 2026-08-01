const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  "http://localhost:5000";

const getImageUrl = (image) => {
  if (!image) {
    return "https://placehold.co/600x450?text=No+Image";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${SERVER_URL}/${image.replace(/\\/g, "/")}`;
};

export default getImageUrl;