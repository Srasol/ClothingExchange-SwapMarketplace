import {
  FaCircle,
  FaMapMarkerAlt,
  FaUserCircle,
} from "react-icons/fa";

function ChatHeader({
  selectedUser,
  selectedUserOnline,
  typingUserId,
  selectedUserId,
}) {
  if (!selectedUser) {
    return null;
  }

  const isTyping =
    typingUserId === selectedUserId;

  const getProfileImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `http://localhost:5000/${String(
      image
    ).replace(/\\/g, "/")}`;
  };

  return (
    <header className="flex items-center gap-4 border-b border-[#e4ded5] bg-[#fffdf9]/95 px-5 py-4 shadow-sm backdrop-blur md:px-6">
      <div className="relative shrink-0">
        {selectedUser.profileImage ? (
          <img
            src={getProfileImageUrl(
              selectedUser.profileImage
            )}
            alt={
              selectedUser.name ||
              "User profile"
            }
            className="h-14 w-14 rounded-2xl border border-[#ded8ce] object-cover shadow-sm"
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7efe9] text-2xl font-bold text-[#1d6b57]">
            {selectedUser.name
              ?.trim()
              ?.charAt(0)
              ?.toUpperCase() || (
              <FaUserCircle />
            )}
          </div>
        )}

        <span
          className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-[3px] border-[#fffdf9] ${
            selectedUserOnline
              ? "bg-emerald-500"
              : "bg-[#afb5b1]"
          }`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-lg font-bold text-[#17201B] md:text-xl">
            {selectedUser.name ||
              "Unknown user"}
          </h2>

          {selectedUserOnline && (
            <FaCircle className="shrink-0 text-[7px] text-emerald-500" />
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          <div
            className={`flex items-center gap-2 text-sm font-medium ${
              isTyping
                ? "text-[#1d6b57]"
                : selectedUserOnline
                ? "text-emerald-600"
                : "text-[#858c87]"
            }`}
          >
            {isTyping ? (
              <>
                <span>Typing</span>

                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1d6b57] [animation-delay:-0.25s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1d6b57] [animation-delay:-0.12s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1d6b57]" />
                </span>
              </>
            ) : (
              <span>
                {selectedUserOnline
                  ? "Online now"
                  : "Offline"}
              </span>
            )}
          </div>

          {selectedUser.location && (
            <div className="flex items-center gap-1.5 text-sm text-[#8a918d]">
              <FaMapMarkerAlt className="text-xs text-[#1d6b57]" />

              <span className="truncate">
                {selectedUser.location}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="hidden rounded-2xl bg-[#17201B] px-4 py-2 text-right text-white sm:block">
        <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#aebbb4]">
          Conversation
        </span>

        <strong className="mt-1 block text-sm">
          SwapStyle Chat
        </strong>
      </div>
    </header>
  );
}

export default ChatHeader;