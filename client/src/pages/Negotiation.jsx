import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaPaperPlane,
  FaTimes,
} from "react-icons/fa";

import API from "../services/api";
import ReviewForm from "./ReviewForm";
import "../styles/negotiation.css";

function Negotiation() {
  const { swapId } = useParams();
  const navigate = useNavigate();

  const [swap, setSwap] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] =
    useState(false);

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  useEffect(() => {
    loadSwap();
  }, [swapId]);

  const loadSwap = async () => {
    try {
      setLoading(true);

      const res = await API.get(
        `/swaps/${swapId}`
      );

      setSwap(res.data.swap || res.data);
    } catch (err) {
      console.error(
        "Load negotiation error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to load negotiation."
      );
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    if (!user?._id) {
      alert("Please login again.");
      return;
    }

    try {
      setSending(true);

      const res = await API.post(
        `/swaps/${swapId}/negotiate`,
        {
          sender: user._id,
          message: message.trim(),
        }
      );

      setSwap(res.data.swap || res.data);
      setMessage("");
    } catch (err) {
      console.error(
        "Send negotiation message error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (action) => {
    try {
      setUpdating(true);

      await API.put(
        `/swaps/${swapId}/${action}`
      );

      // Reload the latest swap from the backend so the
      // updated status is shown immediately.
      await loadSwap();
    } catch (err) {
      console.error(
        "Update swap status error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to update swap."
      );
    } finally {
      setUpdating(false);
    }
  };

  const senderId =
    swap?.sender?._id || swap?.sender;

  const receiverId =
    swap?.receiver?._id || swap?.receiver;

  const isSender =
    String(senderId) === String(user?._id);

  const isReceiver =
    String(receiverId) === String(user?._id);

  const revieweeId = isSender
    ? receiverId
    : senderId;

  const currentStatus = String(
    swap?.status || ""
  )
    .trim()
    .toLowerCase();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div
          className="spinner-border"
          role="status"
        />

        <p className="mt-3">
          Loading negotiation...
        </p>
      </div>
    );
  }

  if (!swap) {
    return (
      <div className="container py-5 text-center">
        <h3>Swap request not found.</h3>

        <Link
          to="/swap-requests"
          className="btn btn-dark mt-3"
        >
          Back to Swap Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="negotiation-page">
      <div className="container py-5">
        <button
          type="button"
          className="btn btn-outline-dark mb-4"
          onClick={() =>
            navigate("/swap-requests")
          }
        >
          <FaArrowLeft className="me-2" />
          Back
        </button>

        <div className="negotiation-card">
          <div className="negotiation-header">
            <div>
              <h2 className="fw-bold mb-1">
                Swap Negotiation
              </h2>

              <p className="mb-0 text-muted">
                {swap.offeredItem?.title ||
                  "Offered item"}{" "}
                for{" "}
                {swap.requestedItem?.title ||
                  "Requested item"}
              </p>
            </div>

            <div className="text-end">
              <span className="badge bg-dark">
                {swap.status}
              </span>

              <p className="mt-2 mb-0 small text-muted">
                Current status:{" "}
                <strong>{swap.status}</strong>
              </p>
            </div>
          </div>

          <div className="item-summary">
            <div>
              <small className="text-muted">
                Offered item
              </small>

              <h5>
                {swap.offeredItem?.title ||
                  "Unavailable"}
              </h5>

              <p className="mb-0">
                Owner:{" "}
                {swap.sender?.name ||
                  "Unknown user"}
              </p>
            </div>

            <div className="swap-arrow">
              ⇄
            </div>

            <div>
              <small className="text-muted">
                Requested item
              </small>

              <h5>
                {swap.requestedItem?.title ||
                  "Unavailable"}
              </h5>

              <p className="mb-0">
                Owner:{" "}
                {swap.receiver?.name ||
                  "Unknown user"}
              </p>
            </div>
          </div>

          <div className="negotiation-messages">
            {swap.message && (
              <div className="initial-message">
                <strong>
                  Initial request:
                </strong>{" "}
                {swap.message}
              </div>
            )}

            {!swap.negotiation ||
            swap.negotiation.length === 0 ? (
              <div className="text-center text-muted py-5">
                No negotiation messages yet.
              </div>
            ) : (
              swap.negotiation.map((item) => {
                const negotiationSenderId =
                  item.sender?._id ||
                  item.sender;

                const ownMessage =
                  String(
                    negotiationSenderId
                  ) === String(user?._id);

                return (
                  <div
                    key={item._id}
                    className={`negotiation-message ${
                      ownMessage
                        ? "own-message"
                        : ""
                    }`}
                  >
                    <small>
                      {ownMessage
                        ? "You"
                        : item.sender?.name ||
                          "User"}
                    </small>

                    <p>{item.message}</p>

                    <span>
                      {item.createdAt
                        ? new Date(
                            item.createdAt
                          ).toLocaleString()
                        : ""}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {currentStatus === "pending" && (
            <form
              className="negotiation-form"
              onSubmit={sendMessage}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Write a negotiation message..."
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
              />

              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  sending || !message.trim()
                }
              >
                <FaPaperPlane className="me-2" />

                {sending
                  ? "Sending..."
                  : "Send"}
              </button>
            </form>
          )}

          {currentStatus === "pending" && (
            <div className="negotiation-actions">
              {isReceiver && (
                <>
                  <button
                    type="button"
                    className="btn btn-success"
                    disabled={updating}
                    onClick={() =>
                      updateStatus("accept")
                    }
                  >
                    <FaCheck className="me-2" />
                    {updating
                      ? "Updating..."
                      : "Accept Swap"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={updating}
                    onClick={() =>
                      updateStatus("reject")
                    }
                  >
                    <FaTimes className="me-2" />
                    Reject Swap
                  </button>
                </>
              )}

              {isSender && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  disabled={updating}
                  onClick={() =>
                    updateStatus("cancel")
                  }
                >
                  <FaTimes className="me-2" />
                  Cancel Request
                </button>
              )}
            </div>
          )}

          {currentStatus === "accepted" && (
            <div className="negotiation-actions">
              <button
                type="button"
                className="btn btn-primary"
                disabled={updating}
                onClick={() =>
                  updateStatus("complete")
                }
              >
                <FaCheck className="me-2" />

                {updating
                  ? "Completing..."
                  : "Mark as Completed"}
              </button>
            </div>
          )}

          {currentStatus === "completed" && (
            <div className="mt-4">
              <div className="alert alert-success">
                <h5 className="mb-2">
                  Swap Completed Successfully!
                </h5>

                <p className="mb-0">
                  Rate your experience with
                  the other user.
                </p>
              </div>

              {!reviewSubmitted ? (
                <ReviewForm
                  swapId={swap._id}
                  revieweeId={revieweeId}
                  onSuccess={() =>
                    setReviewSubmitted(true)
                  }
                />
              ) : (
                <div className="alert alert-info">
                  Thank you! Your review was
                  submitted successfully.
                </div>
              )}
            </div>
          )}

          {currentStatus === "rejected" && (
            <div className="alert alert-danger mt-4 mb-0">
              This swap request was rejected.
            </div>
          )}

          {currentStatus === "cancelled" && (
            <div className="alert alert-warning mt-4 mb-0">
              This swap request was cancelled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Negotiation;