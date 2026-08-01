import { useEffect, useState } from "react";
import axios from "axios";
import { FaBell, FaTrash } from "react-icons/fa";
import { io } from "socket.io-client";
import "../styles/navbar.css";

const socket = io("http://localhost:5000");

function NotificationBell() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const loadNotifications = async () => {
    if (!user?._id) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/notifications/${user._id}`
      );

      setNotifications(response.data);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    if (!user?._id) return;

    socket.emit("join", user._id);

    loadNotifications();

    const handleNewNotification = (notification) => {
      setNotifications((previousNotifications) => {
        const alreadyExists = previousNotifications.some(
          (item) => item._id === notification._id
        );

        if (alreadyExists) {
          return previousNotifications;
        }

        return [notification, ...previousNotifications];
      });
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [user?._id]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/read/${notificationId}`
      );

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error.response?.data || error.message
      );
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/notifications/${notificationId}`
      );

      setNotifications((previousNotifications) =>
        previousNotifications.filter(
          (notification) => notification._id !== notificationId
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error.response?.data || error.message
      );
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div className="notification-bell-wrapper">
      <button
        type="button"
        className="notification-bell-button"
        onClick={() =>
          setShowDropdown((previousValue) => !previousValue)
        }
        aria-label="Open notifications"
      >
        <FaBell size={20} />

        {unreadCount > 0 && (
          <span className="notification-bell-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="d-flex justify-content-between align-items-center border-bottom p-3">
            <h5 className="mb-0 fw-bold">Notifications</h5>

            <span className="badge bg-primary">
              {unreadCount} unread
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center text-muted p-4">
              <FaBell size={28} className="mb-2" />

              <p className="mb-0">No notifications</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                className={`p-3 border-bottom ${
                  item.isRead ? "bg-white" : "bg-light"
                }`}
              >
                <p className="fw-semibold mb-1">
                  {item.sender?.name || "Notification"}
                </p>

                <p className="mb-1">
                  {item.message || "You have a new notification."}
                </p>

                {item.createdAt && (
                  <small className="text-muted">
                    {new Date(item.createdAt).toLocaleString()}
                  </small>
                )}

                <div className="d-flex gap-2 mt-2">
                  {!item.isRead && (
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      onClick={() => markAsRead(item._id)}
                    >
                      Mark read
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteNotification(item._id)}
                    aria-label="Delete notification"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;