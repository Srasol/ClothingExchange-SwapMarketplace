import {
  FaImage,
  FaPaperPlane,
} from "react-icons/fa";

function MessageInput({
  imageInputRef,
  handleImageSelection,
  message,
  handleMessageChange,
  handleKeyDown,
  sendMessage,
  sending,
  selectedImage,
}) {
  const canSend =
    !sending &&
    (message.trim() || selectedImage);

  return (
    <div className="border-t border-[#e2ddd4] bg-[#fffdf9] px-4 py-4 sm:px-6">
      <div className="mx-auto flex max-w-5xl items-end gap-3">
        <input
          ref={imageInputRef}
          type="file"
          hidden
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageSelection}
        />

        <button
          type="button"
          onClick={() =>
            imageInputRef.current?.click()
          }
          disabled={sending}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#ded8ce] bg-[#f4efe7] text-lg text-[#1d6b57] transition hover:border-[#1d6b57] hover:bg-[#e8f2ed] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Attach image"
          title="Attach image"
        >
          <FaImage />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex min-h-12 items-end rounded-2xl border border-[#ded8ce] bg-white px-4 py-2 shadow-sm transition focus-within:border-[#1d6b57] focus-within:ring-4 focus-within:ring-[#1d6b57]/10">
            <textarea
              rows={1}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={sending}
              className="max-h-32 min-h-8 w-full resize-none bg-transparent py-1 text-[#17201B] outline-none placeholder:text-[#929994] disabled:cursor-not-allowed"
            />
          </div>

          <div className="mt-1 flex items-center justify-between px-1">
            <small className="text-[11px] text-[#929994]">
              Press Enter to send · Shift + Enter for a new line
            </small>

            {selectedImage && (
              <small className="font-semibold text-[#1d6b57]">
                Image attached
              </small>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={sendMessage}
          disabled={!canSend}
          className="flex h-12 min-w-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#17201B] px-4 font-semibold text-white shadow-lg shadow-[#17201B]/15 transition hover:-translate-y-0.5 hover:bg-[#26332c] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          aria-label="Send message"
        >
          {sending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

              <span className="hidden sm:inline">
                Sending
              </span>
            </>
          ) : (
            <>
              <FaPaperPlane />

              <span className="hidden sm:inline">
                Send
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default MessageInput;