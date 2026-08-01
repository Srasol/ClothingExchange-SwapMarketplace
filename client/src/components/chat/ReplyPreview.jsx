import {
  FaReply,
  FaTimes,
} from "react-icons/fa";

function ReplyPreview({
  replyMessage,
  getReplySenderName,
  getReplyPreviewText,
  setReplyMessage,
}) {
  if (!replyMessage) {
    return null;
  }

  return (
    <div className="border-t border-[#e2ddd4] bg-[#fffdf9] px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-center gap-3 rounded-2xl border border-[#dcd6cc] bg-[#f4efe7] px-4 py-3 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#17201B] text-white">
          <FaReply />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-[#1d6b57]">
            Replying to{" "}
            {getReplySenderName(replyMessage)}
          </h4>

          <p className="mt-1 truncate text-sm text-[#6f7872]">
            {getReplyPreviewText(replyMessage)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setReplyMessage(null)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#8a918d] transition hover:bg-[#e8ddd4] hover:text-[#9b3d3d]"
          aria-label="Cancel reply"
          title="Cancel reply"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
}

export default ReplyPreview;