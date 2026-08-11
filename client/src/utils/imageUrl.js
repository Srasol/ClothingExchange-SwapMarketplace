const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  "https://clothingexchange-swapmarketplace.onrender.com";

export const getImageUrl = (image) => {
  if (!image) {
    return "/placeholder-image.png";
  }

  if (
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  let cleanPath = String(image)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  cleanPath = cleanPath.replace(
    "http://localhost:5000/",
    ""
  );

  // Old listing records may contain only the filename.
  if (!cleanPath.includes("/")) {
    cleanPath = `uploads/clothing/${cleanPath}`;
  }

  return `${SERVER_URL}/${cleanPath}`;
};