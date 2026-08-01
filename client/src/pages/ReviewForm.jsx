import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function ReviewForm() {
  const navigate = useNavigate();
  const { swapId } = useParams();

  const user = JSON.parse(localStorage.getItem("user"));

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const submitReview = async (e) => {
    e.preventDefault();

    try {
      await API.post("/reviews", {
  reviewer: user._id,
  swap: swapId,
  rating: Number(rating),
  title,
  comment,
});
      alert("Review Submitted Successfully");

      navigate("/swap-requests");
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
          "Error submitting review"
      );
    }
  };

  return (
    <div className="container mt-5">

      <h2 className="mb-4">
        ⭐ Review Swap
      </h2>

      <form onSubmit={submitReview}>

        <div className="mb-3">
          <label>Rating</label>

          <select
            className="form-select"
            value={rating}
            onChange={(e) =>
              setRating(e.target.value)
            }
          >
            <option value="5">⭐⭐⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="2">⭐⭐</option>
            <option value="1">⭐</option>
          </select>
        </div>

        <div className="mb-3">
          <label>Review Title</label>

          <input
            className="form-control"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />
        </div>

        <div className="mb-3">
          <label>Comment</label>

          <textarea
            className="form-control"
            rows="5"
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
          />
        </div>

        <button className="btn btn-success">
          Submit Review
        </button>

      </form>

    </div>
  );
}

export default ReviewForm;