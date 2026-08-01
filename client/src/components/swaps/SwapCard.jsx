import { Link } from "react-router-dom";
import {
  FaCheck,
  FaComments,
  FaExchangeAlt,
  FaStar,
  FaTimes,
  FaUser,
} from "react-icons/fa";

function SwapCard({
  swap,
  user,
  updateStatus,
  updatingId,
}) {
  const isReceiver =
    String(swap.receiver?._id) ===
    String(user?._id);

  const isSender =
    String(swap.sender?._id) ===
    String(user?._id);

  const getBadgeColor = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "Completed":
        return "bg-blue-100 text-blue-700";

      case "Cancelled":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">

      {/* User */}

      <div className="flex items-center justify-between">

        <div>

          <h3 className="flex items-center gap-2 text-xl font-bold">

            <FaUser />

            {isSender
              ? `Sent to ${swap.receiver?.name || "User"}`
              : `Received from ${swap.sender?.name || "User"}`}

          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Clothing Swap Request
          </p>

        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${getBadgeColor(
            swap.status
          )}`}
        >
          {swap.status}
        </span>

      </div>

      {/* Items */}

      <div className="mt-6 grid gap-4 md:grid-cols-2">

        <div className="rounded-2xl bg-slate-50 p-4">

          <p className="text-sm text-gray-500">
            Requested Item
          </p>

          <h4 className="mt-2 text-lg font-bold">
            {swap.requestedItem?.title}
          </h4>

        </div>

        <div className="rounded-2xl bg-slate-50 p-4">

          <p className="text-sm text-gray-500">
            Offered Item
          </p>

          <h4 className="mt-2 text-lg font-bold">
            {swap.offeredItem?.title}
          </h4>

        </div>

      </div>

      {/* Message */}

      {swap.message && (
        <div className="mt-5 rounded-xl bg-violet-50 p-4">

          <div className="flex items-center gap-2 font-semibold text-violet-700">

            <FaExchangeAlt />

            Message

          </div>

          <p className="mt-2 text-gray-700">
            {swap.message}
          </p>

        </div>
      )}

      {/* Buttons */}

      <div className="mt-6 flex flex-wrap gap-3">

        {/* Chat Button */}

        <Link
          to={`/negotiation/${swap._id}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <FaComments />
          Open Negotiation
        </Link>

        {/* Accept & Reject */}

        {swap.status === "Pending" &&
          isReceiver && (
            <>
              <button
                onClick={() =>
                  updateStatus(
                    swap._id,
                    "Accepted"
                  )
                }
                disabled={
                  updatingId === swap._id
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                <FaCheck />
                Accept
              </button>

              <button
                onClick={() =>
                  updateStatus(
                    swap._id,
                    "Rejected"
                  )
                }
                disabled={
                  updatingId === swap._id
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                <FaTimes />
                Reject
              </button>
            </>
          )}

        {/* Cancel */}

        {swap.status === "Pending" &&
          isSender && (
            <button
              onClick={() =>
                updateStatus(
                  swap._id,
                  "Cancelled"
                )
              }
              disabled={
                updatingId === swap._id
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <FaTimes />
              Cancel
            </button>
          )}

        {/* Leave Review */}

        {swap.status === "Completed" && (
          <Link
            to={`/review/${swap._id}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white transition hover:bg-yellow-600"
          >
            <FaStar />
            Leave Review
          </Link>
        )}

      </div>

    </div>
  );
}

export default SwapCard;