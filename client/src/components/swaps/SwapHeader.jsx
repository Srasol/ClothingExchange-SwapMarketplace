import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function SwapHeader({ totalRequests }) {
  return (
    <>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-700 shadow hover:text-violet-600"
      >
        <FaArrowLeft />
        Back to Dashboard
      </Link>

      <div className="mt-6 rounded-3xl bg-gradient-to-r from-violet-700 via-purple-700 to-pink-600 p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Swap Requests
            </h1>

            <p className="mt-3 text-violet-100">
              Manage all your clothing exchange requests in one place.
            </p>
          </div>

          <div className="rounded-2xl bg-white/20 px-8 py-5 text-center backdrop-blur">
            <h2 className="text-4xl font-bold">
              {totalRequests}
            </h2>

            <p className="mt-1">
              Total Requests
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SwapHeader;