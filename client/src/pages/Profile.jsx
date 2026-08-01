import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCamera,
  FaCheckCircle,
  FaEdit,
  FaExchangeAlt,
  FaHeart,
  FaListAlt,
  FaMapMarkerAlt,
  FaSave,
  FaSignOutAlt,
  FaTimes,
  FaUser,
} from "react-icons/fa";

import API from "../services/api";
import "../styles/profile.css";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null") || {};
    } catch {
      return {};
    }
  }, []);

  const userId = storedUser._id || storedUser.id;

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    gender: "",
    dateOfBirth: "",
    profileImage: "",
  });

  const [originalProfile, setOriginalProfile] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [stats, setStats] = useState({
    listings: 0,
    swaps: 0,
    completed: 0,
    wishlist: 0,
  });

  const buildProfile = useCallback((userData = {}) => {
    return {
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      location: userData.location || "",
      bio: userData.bio || "",
      gender: userData.gender || "",
      dateOfBirth: userData.dateOfBirth
        ? userData.dateOfBirth.substring(0, 10)
        : "",
      profileImage: userData.profileImage || "",
    };
  }, []);

  const getImageUrl = useCallback((image) => {
    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    return `http://localhost:5000/${image.replaceAll("\\", "/")}`;
  }, []);

  useEffect(() => {
    const initialProfile = buildProfile(storedUser);

    setProfile(initialProfile);
    setOriginalProfile(initialProfile);
    setImagePreview(getImageUrl(initialProfile.profileImage));
  }, [buildProfile, getImageUrl, storedUser]);

  useEffect(() => {
    const loadStats = async () => {
      if (!userId) {
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);

        const [listingResult, swapResult, wishlistResult] =
          await Promise.allSettled([
            API.get("/listings"),
            API.get("/swaps"),
            API.get("/wishlist"),
          ]);

        const listings =
          listingResult.status === "fulfilled"
            ? Array.isArray(listingResult.value.data)
              ? listingResult.value.data
              : listingResult.value.data?.listings || []
            : [];

        const swaps =
          swapResult.status === "fulfilled"
            ? Array.isArray(swapResult.value.data)
              ? swapResult.value.data
              : swapResult.value.data?.swaps || []
            : [];

        const wishlist =
          wishlistResult.status === "fulfilled"
            ? Array.isArray(wishlistResult.value.data)
              ? wishlistResult.value.data
              : wishlistResult.value.data?.wishlist || []
            : [];

        const myListings = listings.filter((listing) => {
          const ownerId =
            typeof listing.owner === "object"
              ? listing.owner?._id
              : listing.owner;

          return String(ownerId) === String(userId);
        });

        const mySwaps = swaps.filter((swap) => {
          const senderId =
            typeof swap.sender === "object"
              ? swap.sender?._id
              : swap.sender;

          const receiverId =
            typeof swap.receiver === "object"
              ? swap.receiver?._id
              : swap.receiver;

          return (
            String(senderId) === String(userId) ||
            String(receiverId) === String(userId)
          );
        });

        const completed = mySwaps.filter(
          (swap) => swap.status?.toLowerCase() === "completed"
        );

        setStats({
          listings: myListings.length,
          swaps: mySwaps.length,
          completed: completed.length,
          wishlist: wishlist.length,
        });
      } catch (error) {
        console.error(
          "Unable to load profile statistics:",
          error.response?.data || error.message
        );
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [userId]);

  const getInitial = () =>
    profile.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Choose a JPG, PNG or WEBP image.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Profile image must be smaller than 5 MB.",
      });
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage({ type: "", text: "" });
  };

  const startEditing = () => {
    setOriginalProfile(profile);
    setEditing(true);
    setMessage({ type: "", text: "" });
  };

  const cancelEditing = () => {
    setProfile(originalProfile);
    setImagePreview(getImageUrl(originalProfile.profileImage));
    setSelectedImage(null);
    setEditing(false);
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!profile.name.trim() || !profile.email.trim()) {
      setMessage({
        type: "error",
        text: "Name and email are required.",
      });
      return;
    }

    if (!userId) {
      setMessage({
        type: "error",
        text: "User information is missing. Please log in again.",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const formData = new FormData();

      formData.append("name", profile.name.trim());
      formData.append("email", profile.email.trim());
      formData.append("phone", profile.phone.trim());
      formData.append("location", profile.location.trim());
      formData.append("bio", profile.bio.trim());
      formData.append("gender", profile.gender);
      formData.append(
        "dateOfBirth",
        profile.dateOfBirth || ""
      );

      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      const response = await API.put(
        `/users/${userId}`,
        formData
      );

      const updatedUser = response.data.user || response.data;
      const updatedProfile = buildProfile(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      window.dispatchEvent(
        new Event("profileUpdated")
      );

      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setImagePreview(getImageUrl(updatedProfile.profileImage));
      setSelectedImage(null);
      setEditing(false);

      setMessage({
        type: "success",
        text:
          response.data.message ||
          "Profile updated successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to update your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <main className="simple-profile-page">
      <div className="simple-profile-container">
        <section className="simple-profile-header">
          <div className="simple-profile-avatar-wrap">
            <button
              type="button"
              className={`simple-profile-avatar ${
                editing ? "editable" : ""
              }`}
              onClick={() =>
                editing && fileInputRef.current?.click()
              }
              aria-label="Profile image"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={profile.name || "Profile"}
                />
              ) : (
                <span>{getInitial()}</span>
              )}

              {editing && (
                <i>
                  <FaCamera />
                </i>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              hidden
            />
          </div>

          <div className="simple-profile-heading">
            <span className="simple-profile-label">
              <FaUser />
              My Profile
            </span>

            <h1>{profile.name || "Marketplace Member"}</h1>

            <p>
              <FaMapMarkerAlt />
              {profile.location || "Location not added"}
            </p>
          </div>

          <div className="simple-profile-header-actions">
            {!editing ? (
              <button
                type="button"
                className="simple-primary-button"
                onClick={startEditing}
              >
                <FaEdit />
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                className="simple-secondary-button"
                onClick={cancelEditing}
                disabled={saving}
              >
                <FaTimes />
                Cancel
              </button>
            )}

            <button
              type="button"
              className="simple-logout-button"
              onClick={logout}
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </section>

        <section className="simple-profile-stats">
          <StatCard
            icon={<FaListAlt />}
            value={stats.listings}
            label="Listings"
            loading={loadingStats}
          />

          <StatCard
            icon={<FaExchangeAlt />}
            value={stats.swaps}
            label="Total Swaps"
            loading={loadingStats}
          />

          <StatCard
            icon={<FaCheckCircle />}
            value={stats.completed}
            label="Completed"
            loading={loadingStats}
          />

          <StatCard
            icon={<FaHeart />}
            value={stats.wishlist}
            label="Wishlist"
            loading={loadingStats}
          />
        </section>

        <section className="simple-profile-card">
          <div className="simple-profile-card-heading">
            <div>
              <span>PERSONAL INFORMATION</span>
              <h2>Account Details</h2>
            </div>

            <span
              className={`simple-profile-status ${
                editing ? "editing" : ""
              }`}
            >
              {editing ? "Editing" : "Saved"}
            </span>
          </div>

          {message.text && (
            <div
              className={`simple-profile-message ${message.type}`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="simple-profile-grid">
              <ProfileField
                label="Full Name"
                name="name"
                type="text"
                value={profile.name}
                onChange={handleChange}
                disabled={!editing}
              />

              <ProfileField
                label="Email Address"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!editing}
              />

              <ProfileField
                label="Phone Number"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                disabled={!editing}
              />

              <ProfileField
                label="Location"
                name="location"
                type="text"
                value={profile.location}
                onChange={handleChange}
                disabled={!editing}
              />

              <div className="simple-profile-field">
                <label htmlFor="gender">Gender</label>

                <select
                  id="gender"
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  disabled={!editing}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>
                </select>
              </div>

              <ProfileField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={profile.dateOfBirth}
                onChange={handleChange}
                disabled={!editing}
              />

              <div className="simple-profile-field full-width">
                <label htmlFor="bio">Bio</label>

                <textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!editing}
                  maxLength={300}
                  rows={5}
                  placeholder="Tell other users about your style..."
                />

                <small>{profile.bio.length}/300</small>
              </div>
            </div>

            {editing && (
              <div className="simple-profile-actions">
                <button
                  type="button"
                  className="simple-secondary-button"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="simple-primary-button"
                  disabled={saving}
                >
                  <FaSave />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}

function StatCard({ icon, value, label, loading }) {
  return (
    <article className="simple-stat-card">
      <span>{icon}</span>

      <div>
        <strong>{loading ? "—" : value}</strong>
        <small>{label}</small>
      </div>
    </article>
  );
}

function ProfileField({
  label,
  name,
  type,
  value,
  onChange,
  disabled,
}) {
  return (
    <div className="simple-profile-field">
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

export default Profile;