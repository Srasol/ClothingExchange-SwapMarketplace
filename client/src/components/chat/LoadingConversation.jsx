import {
  FaComments,
} from "react-icons/fa";

function LoadingConversation() {
  return (
    <div className="flex h-full items-center justify-center bg-[#f4efe7]">
      <div className="w-full max-w-sm rounded-3xl border border-[#ddd7cd] bg-[#fffdf9] p-8 text-center shadow-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#17201B] text-3xl text-white shadow-lg">
          <FaComments />
        </div>

        <div className="mx-auto mt-6 h-12 w-12 animate-spin rounded-full border-4 border-[#d9d3ca] border-t-[#17201B]" />

        <h2 className="mt-6 text-2xl font-bold text-[#17201B]">
          Loading Conversation
        </h2>

        <p className="mt-3 leading-7 text-[#7f8782]">
          Please wait while we prepare your
          conversation and load all messages.
        </p>

        <div className="mt-6 flex justify-center gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#1d6b57]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#1d6b57] [animation-delay:0.15s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#1d6b57] [animation-delay:0.3s]" />
        </div>
      </div>
    </div>
  );
}

export default LoadingConversation;