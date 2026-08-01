import { useState } from "react";
import {
  FaCheck,
  FaCheckDouble,
  FaMapMarkerAlt,
  FaReply,
  FaRegSmile,
} from "react-icons/fa";

const REACTION_OPTIONS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "😡",
];

function MessageBubble({
  chatMessage,
  mine,
  currentUserId,
  IMAGE_BASE_URL,
  navigate,
  setReplyMessage,
  getReplySenderName,
  getReplyPreviewText,
  formatTime,
  onReaction,
}) {
  const [showReactionPicker, setShowReactionPicker] =
    useState(false);

  const reactions = Array.isArray(
    chatMessage.reactions
  )
    ? chatMessage.reactions
    : [];

  const getReactionUserId = (reaction) => {
    if (!reaction?.user) {
      return "";
    }

    if (typeof reaction.user === "object") {
      return String(
        reaction.user._id ||
          reaction.user.id ||
          ""
      );
    }

    return String(reaction.user);
  };

  const currentUserReaction =
    reactions.find(
      (reaction) =>
        getReactionUserId(reaction) ===
        String(currentUserId)
    );

  const groupedReactions =
    reactions.reduce(
      (groups, reaction) => {
        const emoji = reaction.emoji;

        if (!emoji) {
          return groups;
        }

        if (!groups[emoji]) {
          groups[emoji] = {
            emoji,
            count: 0,
            users: [],
          };
        }

        groups[emoji].count += 1;

        const userName =
          typeof reaction.user === "object" &&
          reaction.user?.name
            ? reaction.user.name
            : "User";

        groups[emoji].users.push(
          userName
        );

        return groups;
      },
      {}
    );

  const reactionGroups =
    Object.values(groupedReactions);

  const handleReactionClick = async (
    emoji
  ) => {
    if (!onReaction) {
      return;
    }

    await onReaction(
      chatMessage._id,
      emoji
    );

    setShowReactionPicker(false);
  };

  const normalizeImageUrl = (
    image
  ) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    const normalizedPath = String(
      image
    ).replace(/\\/g, "/");

    return normalizedPath.startsWith("/")
      ? `${IMAGE_BASE_URL}${normalizedPath}`
      : `${IMAGE_BASE_URL}/${normalizedPath}`;
  };

  const listingImage =
    chatMessage.sharedListing?.image;

  const listingImageUrl =
    listingImage
      ? normalizeImageUrl(listingImage)
      : "https://placehold.co/600x450?text=No+Image";

  const messageImageUrl =
    chatMessage.image
      ? normalizeImageUrl(
          chatMessage.image
        )
      : "";

  return (
    <div
      className={`group flex ${
        mine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`relative max-w-[86%] sm:max-w-[75%] ${
          mine
            ? "items-end"
            : "items-start"
        }`}
      >
        <article
          className={`relative overflow-visible rounded-3xl px-4 py-3 shadow-sm transition ${
            mine
              ? "rounded-br-md bg-[#17201B] text-white"
              : "rounded-bl-md border border-[#e0d9cf] bg-[#fffdf9] text-[#17201B]"
          }`}
        >
          {chatMessage.replyTo && (
            <div
              className={`mb-3 rounded-2xl border-l-4 px-3 py-2 text-sm ${
                mine
                  ? "border-[#a9c8ba] bg-white/10"
                  : "border-[#1d6b57] bg-[#eef4f0]"
              }`}
            >
              <strong
                className={`block text-xs font-bold ${
                  mine
                    ? "text-[#d4e0da]"
                    : "text-[#1d6b57]"
                }`}
              >
                {getReplySenderName(
                  chatMessage.replyTo
                )}
              </strong>

              <p
                className={`mt-1 truncate ${
                  mine
                    ? "text-[#c0cbc5]"
                    : "text-[#66706a]"
                }`}
              >
                {getReplyPreviewText(
                  chatMessage.replyTo
                )}
              </p>
            </div>
          )}

          {messageImageUrl && (
            <img
              src={messageImageUrl}
              alt="Message attachment"
              className="mb-3 max-h-80 w-full rounded-2xl object-cover"
              onError={(event) => {
                event.currentTarget.src =
                  "https://placehold.co/600x450?text=Image+Unavailable";
              }}
            />
          )}

          {chatMessage.message && (
            <p className="whitespace-pre-wrap break-words leading-7">
              {chatMessage.message}
            </p>
          )}

          {chatMessage.sharedListing && (
            <div
              className={`mt-3 overflow-hidden rounded-2xl ${
                mine
                  ? "bg-white text-[#17201B]"
                  : "border border-[#e1dbd1] bg-[#f8f4ed]"
              }`}
            >
              <img
                src={listingImageUrl}
                alt={
                  chatMessage
                    .sharedListing
                    .title ||
                  "Shared listing"
                }
                className="h-44 w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://placehold.co/600x450?text=No+Image";
                }}
              />

              <div className="p-4">
                <h4 className="font-bold">
                  {chatMessage
                    .sharedListing
                    .title ||
                    "Shared listing"}
                </h4>

                <p className="mt-1 font-semibold text-[#1d6b57]">
                  ₹
                  {Number(
                    chatMessage
                      .sharedListing
                      .estimatedValue || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>

                {chatMessage
                  .sharedListing
                  .location && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#7d8580]">
                    <FaMapMarkerAlt className="text-[#1d6b57]" />
                    {
                      chatMessage
                        .sharedListing
                        .location
                    }
                  </p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/item/${chatMessage.sharedListing._id}`
                    )
                  }
                  className="mt-4 w-full rounded-xl bg-[#17201B] px-4 py-2.5 font-semibold text-white transition hover:bg-[#26332c]"
                >
                  View Listing
                </button>
              </div>
            </div>
          )}

          {reactionGroups.length >
            0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {reactionGroups.map(
                (reactionGroup) => {
                  const selected =
                    currentUserReaction
                      ?.emoji ===
                    reactionGroup.emoji;

                  return (
                    <button
                      key={
                        reactionGroup.emoji
                      }
                      type="button"
                      title={reactionGroup.users.join(
                        ", "
                      )}
                      onClick={() =>
                        handleReactionClick(
                          reactionGroup.emoji
                        )
                      }
                      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm transition ${
                        selected
                          ? "border-[#1d6b57] bg-[#e4f0ea] text-[#1d6b57]"
                          : mine
                          ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                          : "border-[#ded8ce] bg-white text-[#5f6963] hover:bg-[#f2eee8]"
                      }`}
                    >
                      <span>
                        {
                          reactionGroup.emoji
                        }
                      </span>

                      <span>
                        {
                          reactionGroup.count
                        }
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          )}

          {showReactionPicker && (
            <div
              className={`absolute bottom-12 z-30 flex gap-1 rounded-full border border-[#ded8ce] bg-[#fffdf9] p-2 shadow-xl ${
                mine
                  ? "right-0"
                  : "left-0"
              }`}
            >
              {REACTION_OPTIONS.map(
                (emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() =>
                      handleReactionClick(
                        emoji
                      )
                    }
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:scale-125 hover:bg-[#f0ece6] ${
                      currentUserReaction
                        ?.emoji ===
                      emoji
                        ? "bg-[#e4f0ea]"
                        : ""
                    }`}
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                )
              )}
            </div>
          )}

          <div
            className={`mt-3 flex flex-wrap items-center justify-between gap-3 text-xs ${
              mine
                ? "text-[#bdc8c2]"
                : "text-[#7f8782]"
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setReplyMessage(
                    chatMessage
                  )
                }
                className={`flex items-center gap-1.5 font-semibold transition ${
                  mine
                    ? "hover:text-white"
                    : "hover:text-[#1d6b57]"
                }`}
              >
                <FaReply />
                Reply
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowReactionPicker(
                    (current) =>
                      !current
                  )
                }
                className={`flex items-center gap-1.5 font-semibold transition ${
                  mine
                    ? "hover:text-white"
                    : "hover:text-[#1d6b57]"
                }`}
              >
                <FaRegSmile />
                React
              </button>
            </div>

            <div className="flex items-center gap-2 whitespace-nowrap">
              <span>
                {formatTime(
                  chatMessage.createdAt
                )}
              </span>

              {mine && (
                <span className="flex items-center gap-1">
                  {chatMessage.isRead ? (
                    <>
                      <FaCheckDouble className="text-emerald-300" />
                      Read
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Sent
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default MessageBubble;