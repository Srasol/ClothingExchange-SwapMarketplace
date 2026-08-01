import {
  FaCircle,
} from "react-icons/fa";

function TypingIndicator() {
  return (
    <div className="mt-4 flex justify-start">
      <div className="flex items-center gap-3 rounded-3xl border border-[#ddd7cd] bg-[#fffdf9] px-5 py-3 shadow-md">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#17201B] text-white">
          <FaCircle className="text-[7px] text-emerald-400" />
        </div>

        <div>
          <p className="mb-1 text-sm font-semibold text-[#17201B]">
            Typing...
          </p>

          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#1d6b57]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#1d6b57] [animation-delay:0.15s]" />
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#1d6b57] [animation-delay:0.3s]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;