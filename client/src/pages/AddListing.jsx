import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCloudUploadAlt,
  FaImage,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaSpinner,
  FaTimes,
  FaTshirt,
} from "react-icons/fa";

import API from "../services/api";
import PageHeader from "../components/PageHeader";

const initialForm = {
  title: "",
  category: "",
  brand: "",
  size: "",
  condition: "",
  description: "",
  estimatedValue: "",
  location: "",
  image: null,
};

function AddListing() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleTextChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSelectedFile = (file) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (file.size > maximumSize) {
      alert("Image size must be less than 5 MB.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setForm((previousForm) => ({
      ...previousForm,
      image: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (event) => {
    handleSelectedFile(event.target.files?.[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    handleSelectedFile(event.dataTransfer.files?.[0]);
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview("");

    setForm((previousForm) => ({
      ...previousForm,
      image: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?._id) {
      alert("Please log in again before adding a listing.");
      navigate("/");
      return;
    }

    if (!form.image) {
      alert("Please upload a clothing image.");
      return;
    }

    const data = new FormData();

    data.append("title", form.title.trim());
    data.append("category", form.category);
    data.append("brand", form.brand.trim());
    data.append("size", form.size);
    data.append("condition", form.condition);
    data.append(
      "description",
      form.description.trim()
    );
    data.append(
      "estimatedValue",
      form.estimatedValue
    );
    data.append("location", form.location.trim());
    data.append("image", form.image);
    data.append("owner", user._id);

    try {
      setLoading(true);

      await API.post("/listings", data);

      alert("Listing added successfully!");

      navigate("/listings");
    } catch (error) {
      console.error("Add listing error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to add listing."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          label="Share Your Style"
          title="Add a New Clothing Listing"
          description="Upload your clothing item, add its details, and make it available for sustainable swapping."
          icon={<FaTshirt />}
          backText="Back to Listings"
          onBack={() => navigate("/listings")}
        />

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]"
        >
          <section className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Clothing Image
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload one clear image of the item.
              </p>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() =>
                !preview && fileInputRef.current?.click()
              }
              className={`relative flex min-h-96 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition ${
                dragActive
                  ? "border-violet-500 bg-violet-50"
                  : "border-slate-300 bg-slate-50 hover:border-violet-400 hover:bg-violet-50/50"
              } ${preview ? "cursor-default" : "cursor-pointer"}`}
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Clothing preview"
                    className="h-96 w-full object-cover"
                  />

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-slate-950/65 p-4 text-white backdrop-blur">
                    <div className="flex min-w-0 items-center gap-3">
                      <FaImage className="shrink-0" />

                      <span className="truncate text-sm font-medium">
                        {form.image?.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={removeImage}
                      className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 transition hover:bg-rose-500"
                      aria-label="Remove image"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 text-4xl text-violet-700">
                    <FaCloudUploadAlt />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    Drop your image here
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Or click to browse. JPG, PNG and WEBP
                    files up to 5 MB are supported.
                  </p>

                  <span className="mt-5 inline-flex rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white shadow-md">
                    Choose Image
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {preview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                Choose a Different Image
              </button>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Listing Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Provide accurate details to help other users
                understand your clothing item.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className={labelClass}
                >
                  Listing Title
                </label>

                <input
                  id="title"
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleTextChange}
                  placeholder="For example, Nike Sports T-Shirt"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="brand"
                  className={labelClass}
                >
                  Brand
                </label>

                <input
                  id="brand"
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleTextChange}
                  placeholder="For example, Nike"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className={labelClass}
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleTextChange}
                  required
                  className={inputClass}
                >
                  <option value="">
                    Select category
                  </option>
                  <option value="T-Shirt">
                    T-Shirt
                  </option>
                  <option value="Shirt">
                    Shirt
                  </option>
                  <option value="Jeans">
                    Jeans
                  </option>
                  <option value="Dress">
                    Dress
                  </option>
                  <option value="Jacket">
                    Jacket
                  </option>
                  <option value="Hoodie">
                    Hoodie
                  </option>
                  <option value="Sweater">
                    Sweater
                  </option>
                  <option value="Kurta">
                    Kurta
                  </option>
                  <option value="Saree">
                    Saree
                  </option>
                  <option value="Shoes">
                    Shoes
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="size"
                  className={labelClass}
                >
                  Size
                </label>

                <select
                  id="size"
                  name="size"
                  value={form.size}
                  onChange={handleTextChange}
                  required
                  className={inputClass}
                >
                  <option value="">
                    Select size
                  </option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="Free Size">
                    Free Size
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="condition"
                  className={labelClass}
                >
                  Condition
                </label>

                <select
                  id="condition"
                  name="condition"
                  value={form.condition}
                  onChange={handleTextChange}
                  required
                  className={inputClass}
                >
                  <option value="">
                    Select condition
                  </option>
                  <option value="New">New</option>
                  <option value="Like New">
                    Like New
                  </option>
                  <option value="Excellent">
                    Excellent
                  </option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="estimatedValue"
                  className={labelClass}
                >
                  Estimated Value
                </label>

                <div className="relative">
                  <FaRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="estimatedValue"
                    type="number"
                    name="estimatedValue"
                    value={form.estimatedValue}
                    onChange={handleTextChange}
                    placeholder="For example, 700"
                    min="0"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className={labelClass}
                >
                  Location
                </label>

                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleTextChange}
                    placeholder="For example, Hyderabad"
                    required
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className={labelClass}
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleTextChange}
                  placeholder="Describe the clothing item, how often it was used, and any important details..."
                  rows={6}
                  maxLength={1000}
                  className={`${inputClass} resize-none`}
                />

                <p className="mt-2 text-right text-xs text-slate-400">
                  {form.description.length}/1000
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/listings")}
                disabled={loading}
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Adding Listing...
                  </>
                ) : (
                  <>
                    <FaTshirt />
                    Add Listing
                  </>
                )}
              </button>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}

export default AddListing;