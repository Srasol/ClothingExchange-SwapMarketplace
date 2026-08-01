import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { io } from "socket.io-client";

import API from "../services/api";

import ChatSidebar from "../components/chat/ChatSidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";
import ReplyPreview from "../components/chat/ReplyPreview";
import ImagePreview from "../components/chat/ImagePreview";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

const IMAGE_BASE_URL =
  import.meta.env.VITE_SERVER_URL ||
  "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});

function Chat() {
  const navigate = useNavigate();

  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch (error) {
      console.error(
        "Unable to read logged-in user:",
        error
      );

      return null;
    }
  }, []);

  const currentUserId = String(
    loggedInUser?._id ||
      loggedInUser?.id ||
      ""
  );

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [replyMessage, setReplyMessage] =
    useState(null);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  const [unreadCounts, setUnreadCounts] =
    useState({});

  const [search, setSearch] =
    useState("");

  const [typingUserId, setTypingUserId] =
    useState(null);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  const selectedUserRef = useRef(null);

  const messagesContainerRef =
    useRef(null);

  const typingTimeoutRef =
    useRef(null);

  const imageInputRef =
    useRef(null);

  useEffect(() => {
    selectedUserRef.current =
      selectedUser;
  }, [selectedUser]);

  const getId = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "object") {
      return String(
        value._id ||
          value.id ||
          ""
      );
    }

    return String(value);
  };

  const isSelectedConversationMessage = (
    chatMessage
  ) => {
    const selectedId = getId(
      selectedUserRef.current
    );

    if (
      !selectedId ||
      !currentUserId
    ) {
      return false;
    }

    const senderId = getId(
      chatMessage.sender
    );

    const receiverId = getId(
      chatMessage.receiver
    );

    return (
      (senderId === currentUserId &&
        receiverId === selectedId) ||
      (senderId === selectedId &&
        receiverId === currentUserId)
    );
  };

  const addMessageWithoutDuplicate = (
    newMessage
  ) => {
    if (!newMessage) {
      return;
    }

    setMessages((currentMessages) => {
      const alreadyExists =
        currentMessages.some(
          (item) =>
            String(item._id) ===
            String(newMessage._id)
        );

      if (alreadyExists) {
        return currentMessages;
      }

      return [
        ...currentMessages,
        newMessage,
      ];
    });
  };

  const updateLatestMessage = (
    otherUserId,
    latestMessage
  ) => {
    setUsers((currentUsers) => {
      const updatedUsers =
        currentUsers.map(
          (chatUser) => {
            if (
              getId(chatUser) ===
              String(otherUserId)
            ) {
              return {
                ...chatUser,
                latestMessage,
              };
            }

            return chatUser;
          }
        );

      return updatedUsers.sort(
        (firstUser, secondUser) => {
          if (
            !firstUser.latestMessage &&
            !secondUser.latestMessage
          ) {
            return (
              firstUser.name || ""
            ).localeCompare(
              secondUser.name || ""
            );
          }

          if (!firstUser.latestMessage) {
            return 1;
          }

          if (!secondUser.latestMessage) {
            return -1;
          }

          return (
            new Date(
              secondUser.latestMessage
                .createdAt
            ) -
            new Date(
              firstUser.latestMessage
                .createdAt
            )
          );
        }
      );
    });
  };

  const loadUsers = async () => {
    if (!currentUserId) {
      setLoadingUsers(false);
      return;
    }

    try {
      setLoadingUsers(true);

      const response = await API.get(
        `/messages/users/${currentUserId}`
      );

      const receivedUsers =
        Array.isArray(response.data)
          ? response.data
          : [];

      setUsers(receivedUsers);

      if (
        receivedUsers.length > 0 &&
        !selectedUserRef.current
      ) {
        setSelectedUser(
          receivedUsers[0]
        );
      }
    } catch (error) {
      console.error(
        "Load chat users error:",
        error.response?.data ||
          error.message
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadUnreadCounts =
    async () => {
      if (!currentUserId) {
        return;
      }

      try {
        const response =
          await API.get(
            `/messages/unread/${currentUserId}`
          );

        setUnreadCounts(
          response.data || {}
        );
      } catch (error) {
        console.error(
          "Load unread counts error:",
          error.response?.data ||
            error.message
        );
      }
    };

  const markConversationAsRead =
    async (otherUserId) => {
      if (
        !otherUserId ||
        !currentUserId
      ) {
        return;
      }

      try {
        await API.put(
          `/messages/read/${otherUserId}/${currentUserId}`
        );

        setMessages(
          (currentMessages) =>
            currentMessages.map(
              (item) => {
                const senderId =
                  getId(item.sender);

                const receiverId =
                  getId(
                    item.receiver
                  );

                if (
                  senderId ===
                    String(
                      otherUserId
                    ) &&
                  receiverId ===
                    currentUserId
                ) {
                  return {
                    ...item,
                    isRead: true,
                  };
                }

                return item;
              }
            )
        );

        setUnreadCounts(
          (currentCounts) => ({
            ...currentCounts,
            [otherUserId]: 0,
          })
        );

        socket.emit(
          "messagesRead",
          {
            sender: otherUserId,
            receiver:
              currentUserId,
          }
        );
      } catch (error) {
        console.error(
          "Mark messages read error:",
          error.response?.data ||
            error.message
        );
      }
    };

  const loadConversation =
    async (otherUser) => {
      const otherUserId =
        getId(otherUser);

      if (
        !currentUserId ||
        !otherUserId
      ) {
        return;
      }

      try {
        setLoadingMessages(true);
        setMessages([]);

        const response =
          await API.get(
            `/messages/${currentUserId}/${otherUserId}`
          );

        setMessages(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );

        await markConversationAsRead(
          otherUserId
        );
      } catch (error) {
        console.error(
          "Load conversation error:",
          error.response?.data ||
            error.message
        );
      } finally {
        setLoadingMessages(false);
      }
    };

  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    loadUsers();
    loadUnreadCounts();

    socket.connect();

    socket.emit(
      "join",
      currentUserId
    );

    const handleConnect = () => {
      console.log(
        "Chat socket connected:",
        socket.id
      );

      socket.emit(
        "join",
        currentUserId
      );
    };

    const handleConnectError = (
      error
    ) => {
      console.error(
        "Socket connection error:",
        error.message
      );
    };

    const handleOnlineUsers = (
      connectedUsers
    ) => {
      const safeUsers =
        Array.isArray(
          connectedUsers
        )
          ? connectedUsers
          : [];

      setOnlineUsers(
        safeUsers.map(String)
      );
    };

    const handleReceiveMessage =
      async (newMessage) => {
        const senderId =
          getId(
            newMessage.sender
          );

        const receiverId =
          getId(
            newMessage.receiver
          );

        const otherUserId =
          senderId ===
          currentUserId
            ? receiverId
            : senderId;

        updateLatestMessage(
          otherUserId,
          newMessage
        );

        if (
          isSelectedConversationMessage(
            newMessage
          )
        ) {
          addMessageWithoutDuplicate(
            newMessage
          );

          if (
            senderId !==
            currentUserId
          ) {
            await markConversationAsRead(
              senderId
            );
          }
        } else if (
          senderId !==
          currentUserId
        ) {
          setUnreadCounts(
            (currentCounts) => ({
              ...currentCounts,
              [senderId]:
                (currentCounts[
                  senderId
                ] || 0) + 1,
            })
          );
        }
      };

    const handleTyping = (
      data
    ) => {
      const senderId = getId(
        data?.sender
      );

      const selectedId = getId(
        selectedUserRef.current
      );

      if (
        senderId &&
        senderId === selectedId
      ) {
        setTypingUserId(
          senderId
        );
      }
    };

    const handleStopTyping = (
      data
    ) => {
      const senderId = getId(
        data?.sender
      );

      const selectedId = getId(
        selectedUserRef.current
      );

      if (
        senderId &&
        senderId === selectedId
      ) {
        setTypingUserId(null);
      }
    };

    const handleMessagesRead = (
      data
    ) => {
      const readerId = getId(
        data?.receiver
      );

      setMessages(
        (currentMessages) =>
          currentMessages.map(
            (item) => {
              const senderId =
                getId(
                  item.sender
                );

              const receiverId =
                getId(
                  item.receiver
                );

              if (
                senderId ===
                  currentUserId &&
                receiverId ===
                  readerId
              ) {
                return {
                  ...item,
                  isRead: true,
                };
              }

              return item;
            }
          )
      );
    };

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "connect_error",
      handleConnectError
    );

    socket.on(
      "onlineUsers",
      handleOnlineUsers
    );

    socket.on(
      "receiveMessage",
      handleReceiveMessage
    );

    socket.on(
      "typing",
      handleTyping
    );

    socket.on(
      "stopTyping",
      handleStopTyping
    );

    socket.on(
      "messagesRead",
      handleMessagesRead
    );

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "connect_error",
        handleConnectError
      );

      socket.off(
        "onlineUsers",
        handleOnlineUsers
      );

      socket.off(
        "receiveMessage",
        handleReceiveMessage
      );

      socket.off(
        "typing",
        handleTyping
      );

      socket.off(
        "stopTyping",
        handleStopTyping
      );

      socket.off(
        "messagesRead",
        handleMessagesRead
      );

      socket.disconnect();

      clearTimeout(
        typingTimeoutRef.current
      );
    };
  }, [currentUserId]);

  useEffect(() => {
    if (selectedUser) {
      loadConversation(
        selectedUser
      );

      setTypingUserId(null);
    }
  }, [selectedUser]);

  useEffect(() => {
    const container =
      messagesContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typingUserId]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

  const handleMessageChange = (
    event
  ) => {
    const newValue =
      event.target.value;

    setMessage(newValue);

    if (!selectedUser) {
      return;
    }

    const receiverId = getId(
      selectedUser
    );

    if (!newValue.trim()) {
      socket.emit(
        "stopTyping",
        {
          sender:
            currentUserId,
          receiver:
            receiverId,
        }
      );

      return;
    }

    socket.emit("typing", {
      sender: currentUserId,
      receiver: receiverId,
    });

    clearTimeout(
      typingTimeoutRef.current
    );

    typingTimeoutRef.current =
      setTimeout(() => {
        socket.emit(
          "stopTyping",
          {
            sender:
              currentUserId,
            receiver:
              receiverId,
          }
        );
      }, 1000);
  };

  const handleImageSelection = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      alert(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Image size must be below 5 MB."
      );

      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setSelectedImage(file);

    setImagePreview(
      URL.createObjectURL(file)
    );
  };

  const removeSelectedImage =
    () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }

      setSelectedImage(null);
      setImagePreview("");

      if (
        imageInputRef.current
      ) {
        imageInputRef.current.value =
          "";
      }
    };

  const sendMessage = async () => {
    const cleanMessage =
      message.trim();

    if (
      !selectedUser ||
      !currentUserId ||
      (!cleanMessage &&
        !selectedImage)
    ) {
      return;
    }

    const receiverId = getId(
      selectedUser
    );

    try {
      setSending(true);

      clearTimeout(
        typingTimeoutRef.current
      );

      socket.emit(
        "stopTyping",
        {
          sender: currentUserId,
          receiver: receiverId,
        }
      );

      const formData =
        new FormData();

      formData.append(
        "sender",
        currentUserId
      );

      formData.append(
        "receiver",
        receiverId
      );

      if (cleanMessage) {
        formData.append(
          "message",
          cleanMessage
        );
      }

      if (replyMessage?._id) {
        formData.append(
          "replyTo",
          replyMessage._id
        );
      }

      if (selectedImage) {
        formData.append(
          "image",
          selectedImage
        );
      }

      const response =
        await API.post(
          "/messages",
          formData
        );

      const savedMessage =
        response.data;

      addMessageWithoutDuplicate(
        savedMessage
      );

      updateLatestMessage(
        receiverId,
        savedMessage
      );

      socket.emit(
        "sendMessage",
        savedMessage
      );

      setMessage("");
      setReplyMessage(null);
      removeSelectedImage();
    } catch (error) {
      console.error(
        "Send message error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data
          ?.message ||
          "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  const handleReaction = async (
    messageId,
    emoji
  ) => {
    try {
      const response =
        await API.put(
          `/messages/reaction/${messageId}`,
          {
            userId:
              currentUserId,
            emoji,
          }
        );

      const updatedMessage =
        response.data;

      setMessages(
        (oldMessages) =>
          oldMessages.map(
            (item) =>
              String(
                item._id
              ) ===
              String(
                updatedMessage._id
              )
                ? updatedMessage
                : item
          )
      );
    } catch (error) {
      console.error(
        "Reaction error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data
          ?.message ||
          "Reaction failed."
      );
    }
  };

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleUserSelection = (
    user
  ) => {
    clearTimeout(
      typingTimeoutRef.current
    );

    if (selectedUser) {
      socket.emit(
        "stopTyping",
        {
          sender: currentUserId,
          receiver: getId(
            selectedUser
          ),
        }
      );
    }

    setMessage("");
    setReplyMessage(null);
    removeSelectedImage();
    setSelectedUser(user);
  };

  const filteredUsers =
    users.filter((chatUser) => {
      const query = search
        .trim()
        .toLowerCase();

      return (
        chatUser.name
          ?.toLowerCase()
          .includes(query) ||
        chatUser.email
          ?.toLowerCase()
          .includes(query) ||
        chatUser.location
          ?.toLowerCase()
          .includes(query)
      );
    });

  const formatTime = (
    dateValue
  ) => {
    if (!dateValue) {
      return "";
    }

    return new Date(
      dateValue
    ).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getReplyPreviewText = (
    repliedMessage
  ) => {
    if (!repliedMessage) {
      return "Message unavailable";
    }

    if (
      repliedMessage.message
    ) {
      return repliedMessage.message;
    }

    if (repliedMessage.image) {
      return "📷 Photo";
    }

    if (
      repliedMessage.sharedListing
    ) {
      return `👕 ${
        repliedMessage
          .sharedListing
          .title ||
        "Shared listing"
      }`;
    }

    return "Message";
  };

  const getReplySenderName = (
    repliedMessage
  ) => {
    const senderId = getId(
      repliedMessage?.sender
    );

    if (
      senderId ===
      currentUserId
    ) {
      return "You";
    }

    return (
      repliedMessage?.sender
        ?.name ||
      selectedUser?.name ||
      "User"
    );
  };

  const getLatestMessagePreview = (
    chatUser,
    isOnline
  ) => {
    const latestMessage =
      chatUser.latestMessage;

    if (!latestMessage) {
      return isOnline
        ? "Online"
        : chatUser.location ||
            chatUser.email ||
            "No messages yet";
    }

    if (
      latestMessage.sharedListing
    ) {
      return "👕 Shared a listing";
    }

    if (latestMessage.image) {
      return "📷 Photo";
    }

    if (
      latestMessage.message
    ) {
      return latestMessage.message;
    }

    return "New message";
  };

  const selectedUserId =
    getId(selectedUser);

  const selectedUserOnline =
    onlineUsers.includes(
      selectedUserId
    );

  if (!currentUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <h2 className="text-xl font-bold text-red-600">
            Login Required
          </h2>

          <p className="mt-2 text-gray-600">
            User information was not
            found. Please log out and
            log in again.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="mt-5 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen overflow-hidden bg-slate-100">
      <div className="mx-auto flex h-full max-w-[1600px] overflow-hidden bg-white shadow-xl">
        <ChatSidebar
          users={filteredUsers}
          selectedUserId={
            selectedUserId
          }
          search={search}
          setSearch={setSearch}
          handleUserSelection={
            handleUserSelection
          }
          onlineUsers={
            onlineUsers
          }
          unreadCounts={
            unreadCounts
          }
          getId={getId}
          formatTime={
            formatTime
          }
          getLatestMessagePreview={
            getLatestMessagePreview
          }
          loadingUsers={
            loadingUsers
          }
        />

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {!selectedUser ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full bg-violet-100 p-6">
                <FaUserCircle className="text-8xl text-violet-500" />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-800">
                Select a conversation
              </h2>

              <p className="mt-2 max-w-md text-gray-500">
                Choose a user from the
                sidebar to view messages
                and start chatting.
              </p>
            </div>
          ) : (
            <>
              <ChatHeader
                selectedUser={
                  selectedUser
                }
                selectedUserOnline={
                  selectedUserOnline
                }
                typingUserId={
                  typingUserId
                }
                selectedUserId={
                  selectedUserId
                }
              />

              <MessageList
                messages={
                  messages
                }
                loadingMessages={
                  loadingMessages
                }
                typingUserId={
                  typingUserId
                }
                selectedUserId={
                  selectedUserId
                }
                currentUserId={
                  currentUserId
                }
                IMAGE_BASE_URL={
                  IMAGE_BASE_URL
                }
                navigate={
                  navigate
                }
                setReplyMessage={
                  setReplyMessage
                }
                getId={getId}
                getReplySenderName={
                  getReplySenderName
                }
                getReplyPreviewText={
                  getReplyPreviewText
                }
                formatTime={
                  formatTime
                }
                messagesContainerRef={
                  messagesContainerRef
                }
                onReaction={
                  handleReaction
                }
              />

              <ReplyPreview
                replyMessage={
                  replyMessage
                }
                getReplySenderName={
                  getReplySenderName
                }
                getReplyPreviewText={
                  getReplyPreviewText
                }
                setReplyMessage={
                  setReplyMessage
                }
              />

              <ImagePreview
                imagePreview={
                  imagePreview
                }
                removeSelectedImage={
                  removeSelectedImage
                }
              />

              <MessageInput
                imageInputRef={
                  imageInputRef
                }
                handleImageSelection={
                  handleImageSelection
                }
                message={message}
                handleMessageChange={
                  handleMessageChange
                }
                handleKeyDown={
                  handleKeyDown
                }
                sendMessage={
                  sendMessage
                }
                sending={sending}
                selectedImage={
                  selectedImage
                }
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default Chat;
