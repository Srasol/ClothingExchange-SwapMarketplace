import {
  FaComments,
  FaExchangeAlt,
} from "react-icons/fa";

function EmptyConversation() {
  return (
    <div className="flex h-full items-center justify-center bg-[#f4efe7] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#ddd7cd] bg-[#fffdf9] p-10 text-center shadow-xl">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-[#17201B] text-4xl text-white shadow-lg">
          <FaComments />
        </div>

        <h2 className="mt-8 text-3xl font-bold text-[#17201B]">
          No Messages Yet
        </h2>

        <p className="mt-4 leading-7 text-[#7d8580]">
          Your conversation is empty.
          <br />
          Start chatting with another SwapStyle user and
          exchange clothing ideas, negotiate swaps, or
          discuss listings.
        </p>

        <div className="mt-8 rounded-2xl bg-[#f4efe7] p-5">
          <div className="flex items-center justify-center gap-3 text-[#1d6b57]">
            <FaExchangeAlt className="text-xl" />

            <span className="font-semibold">
              Sustainable Fashion Starts Here
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-[#8b928d]">
            Share listings, negotiate exchanges, and
            build your SwapStyle community.
          </p>
        </div>

        <button
          type="button"
          className="mt-8 rounded-2xl bg-[#17201B] px-8 py-3 font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#26332c] hover:shadow-lg"
        >
          Start a Conversation
        </button>
      </div>
    </div>
  );
}

export default EmptyConversation;