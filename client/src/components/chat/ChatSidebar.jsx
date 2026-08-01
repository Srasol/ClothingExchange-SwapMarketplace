import {
  FaCircle,
  FaComments,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";

function ChatSidebar({
  users,
  selectedUserId,
  search,
  setSearch,
  handleUserSelection,
  onlineUsers,
  unreadCounts,
  getId,
  formatTime,
  getLatestMessagePreview,
  loadingUsers,
}) {
  return (
    <aside className="flex w-full flex-col border-r border-[#ded8ce] bg-[#fffdf9] md:w-80 lg:w-96">
      <div className="border-b border-[#e8e2d9] bg-[#17201B] px-5 py-6 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl text-[#17201B]">
            <FaComments />
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              Messages
            </h2>

            <p className="mt-1 text-sm text-[#bcc6c0]">
              Connect with the SwapStyle community
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-[#ebe5dc] p-4">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b938e]" />

          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="h-12 w-full rounded-2xl border border-[#ded8ce] bg-[#f5f1ea] pl-11 pr-4 text-[#17201B] outline-none transition placeholder:text-[#9aa09c] focus:border-[#1d6b57] focus:bg-white focus:ring-4 focus:ring-[#1d6b57]/10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loadingUsers ? (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#d9d3ca] border-t-[#17201B]" />

            <p className="mt-4 text-sm font-medium text-[#7f8782]">
              Loading conversations...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-[#d8d1c6] bg-[#f7f3ed] px-6 text-center">
            <FaUserCircle className="text-5xl text-[#b8bdb9]" />

            <h3 className="mt-4 font-bold text-[#17201B]">
              No users found
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#858c87]">
              Try searching with a different name,
              email or location.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => {
              const id = getId(user);
              const active =
                selectedUserId === id;
              const online =
                onlineUsers.includes(id);
              const unread =
                unreadCounts[id] || 0;

              return (
                <button
                  type="button"
                  key={id}
                  onClick={() =>
                    handleUserSelection(user)
                  }
                  className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    active
                      ? "border-[#17201B] bg-[#17201B] text-white shadow-lg shadow-[#17201B]/15"
                      : "border-transparent bg-transparent text-[#17201B] hover:border-[#e1dbd1] hover:bg-[#f5f1ea]"
                  }`}
                >
                  <div className="relative shrink-0">
                    {user.profileImage ? (
                      <img
                        src={
                          user.profileImage.startsWith(
                            "http"
                          )
                            ? user.profileImage
                            : `http://localhost:5000/${String(
                                user.profileImage
                              ).replace(/\\/g, "/")}`
                        }
                        alt={
                          user.name || "User"
                        }
                        className="h-12 w-12 rounded-2xl object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold ${
                          active
                            ? "bg-white/12 text-white"
                            : "bg-[#e6eee9] text-[#1d6b57]"
                        }`}
                      >
                        {user.name
                          ?.trim()
                          ?.charAt(0)
                          ?.toUpperCase() || (
                          <FaUserCircle />
                        )}
                      </div>
                    )}

                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 ${
                        active
                          ? "border-[#17201B]"
                          : "border-[#fffdf9]"
                      } ${
                        online
                          ? "bg-emerald-500"
                          : "bg-[#b6bbb8]"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="truncate font-bold">
                        {user.name ||
                          "Unknown user"}
                      </h3>

                      {user.latestMessage && (
                        <small
                          className={`shrink-0 text-xs ${
                            active
                              ? "text-[#b9c4bd]"
                              : "text-[#929994]"
                          }`}
                        >
                          {formatTime(
                            user.latestMessage
                              .createdAt
                          )}
                        </small>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <p
                        className={`min-w-0 flex-1 truncate text-sm ${
                          active
                            ? "text-[#c3ccc7]"
                            : "text-[#7f8782]"
                        }`}
                      >
                        {getLatestMessagePreview(
                          user,
                          online
                        )}
                      </p>

                      {online && !user.latestMessage && (
                        <span
                          className={`flex items-center gap-1 text-[11px] font-bold ${
                            active
                              ? "text-emerald-300"
                              : "text-emerald-600"
                          }`}
                        >
                          <FaCircle className="text-[6px]" />
                          Online
                        </span>
                      )}
                    </div>
                  </div>

                  {unread > 0 && (
                    <span
                      className={`flex min-w-6 items-center justify-center rounded-full px-2 py-1 text-xs font-bold ${
                        active
                          ? "bg-white text-[#17201B]"
                          : "bg-[#1d6b57] text-white"
                      }`}
                    >
                      {unread > 99
                        ? "99+"
                        : unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

export default ChatSidebar;