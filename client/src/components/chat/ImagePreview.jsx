import {
  FaImage,
  FaTimes,
} from "react-icons/fa";

function ImagePreview({
  imagePreview,
  removeSelectedImage,
}) {
  if (!imagePreview) {
    return null;
  }

  return (
    <div className="border-t border-[#e2ddd4] bg-[#fffdf9] px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="relative inline-block overflow-hidden rounded-2xl border border-[#ddd7cd] bg-[#f4efe7] p-2 shadow-sm">
          <img
            src={imagePreview}
            alt="Selected attachment preview"
            className="max-h-56 max-w-full rounded-xl object-cover"
          />

          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-[#17201B]/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <FaImage />
            Image attached
          </div>

          <button
            type="button"
            onClick={removeSelectedImage}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#17201B]/90 text-white shadow-lg backdrop-blur transition hover:scale-105 hover:bg-[#9b3d3d]"
            aria-label="Remove selected image"
            title="Remove image"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImagePreview;