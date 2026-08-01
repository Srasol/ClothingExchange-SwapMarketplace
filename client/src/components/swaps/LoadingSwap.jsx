import { FaSpinner } from "react-icons/fa";

function LoadingSwap() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-3xl bg-white px-10 py-12 text-center shadow-xl">
        <FaSpinner className="mx-auto text-5xl animate-spin text-violet-600" />

        <h2 className="mt-5 text-2xl font-bold text-gray-800">
          Loading Swap Requests...
        </h2>

        <p className="mt-2 text-gray-500">
          Please wait while we fetch your swap requests.
        </p>
      </div>
    </div>
  );
}

export default LoadingSwap;