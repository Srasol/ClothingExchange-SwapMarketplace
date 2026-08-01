import { Link } from "react-router-dom";
import { FaExchangeAlt } from "react-icons/fa";

function EmptySwap() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-3xl bg-white p-12 shadow-xl text-center max-w-lg">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-violet-100">
          <FaExchangeAlt className="text-4xl text-violet-600" />
        </div>

        <h2 className="mt-6 text-3xl font-bold">
          No Swap Requests
        </h2>

        <p className="mt-3 text-gray-500">
          You haven't sent or received any clothing swap requests yet.
        </p>

        <Link
          to="/listings"
          className="mt-8 inline-block rounded-xl bg-violet-600 px-8 py-3 font-semibold text-white transition hover:bg-violet-700"
        >
          Browse Listings
        </Link>

      </div>
    </div>
  );
}

export default EmptySwap;