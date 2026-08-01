import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import EmptyConversation from "./EmptyConversation";

function MessageList({
  messages,
  loadingMessages,
  typingUserId,
  selectedUserId,
  currentUserId,
  IMAGE_BASE_URL,
  navigate,
  setReplyMessage,
  getId,
  getReplySenderName,
  getReplyPreviewText,
  formatTime,
  messagesContainerRef,
  onReaction,
}) {
  return (
    <div
      ref={messagesContainerRef}
      className="relative flex-1 overflow-y-auto bg-[#f4efe7] px-4 py-6 sm:px-6"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-[#dfe8e2] blur-3xl" />
        <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-[#eee3d4] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-full max-w-5xl flex-col">
        {loadingMessages ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="rounded-3xl border border-[#ded8ce] bg-[#fffdf9] px-8 py-10 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#d9d3ca] border-t-[#17201B]" />

              <h3 className="mt-4 font-bold text-[#17201B]">
                Loading messages
              </h3>

              <p className="mt-2 text-sm text-[#7f8782]">
                Please wait while the conversation is prepared.
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyConversation />
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {messages.map((chatMessage) => {
                const mine =
                  getId(chatMessage.sender) === currentUserId;

                return (
                  <MessageBubble
                    key={chatMessage._id}
                    chatMessage={chatMessage}
                    mine={mine}
                    currentUserId={currentUserId}
                    IMAGE_BASE_URL={IMAGE_BASE_URL}
                    navigate={navigate}
                    setReplyMessage={setReplyMessage}
                    getReplySenderName={getReplySenderName}
                    getReplyPreviewText={getReplyPreviewText}
                    formatTime={formatTime}
                    onReaction={onReaction}
                  />
                );
              })}
            </div>

            {typingUserId === selectedUserId && (
              <div className="mt-3">
                <TypingIndicator />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MessageList;