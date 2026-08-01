import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/users");
      setUsers(response.data?.users || response.data || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        [user.name, user.email, user.phone, user.location].some(
          (value) =>
            String(value || "")
              .toLowerCase()
              .includes(query)
        );

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const updateRole = async (userId, role) => {
    try {
      setBusyId(userId);
      setError("");
      setMessage("");

      const response = await API.put(
        `/admin/users/${userId}/role`,
        { role }
      );

      const updated = response.data?.user || response.data;

      setUsers((current) =>
        current.map((user) =>
          user._id === userId
            ? { ...user, ...updated, role: updated?.role || role }
            : user
        )
      );

      setMessage("User role updated successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update user role."
      );
    } finally {
      setBusyId("");
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name || "this user"}?`)) {
      return;
    }

    try {
      setBusyId(user._id);
      setError("");
      setMessage("");

      await API.delete(`/admin/users/${user._id}`);

      setUsers((current) =>
        current.filter((item) => item._id !== user._id)
      );

      setMessage("User deleted successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to delete user."
      );
    } finally {
      setBusyId("");
    }
  };

  return (
    <main className="admin-page">
      <PageHeader
        title="Users"
        description="Search, manage roles and remove registered users."
        count={`${users.length} Users`}
      />

      <Messages message={message} error={error} />

      <section className="admin-toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, phone or location..."
        />

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="all">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>

        <button type="button" onClick={loadUsers}>
          Refresh
        </button>
      </section>

      <section className="admin-panel">
        {loading ? (
          <Loading />
        ) : filteredUsers.length === 0 ? (
          <Empty text="No users found." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const isCurrent =
                    String(currentUser?._id || currentUser?.id) ===
                    String(user._id);

                  return (
                    <tr key={user._id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-avatar">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <strong>{user.name || "Unknown"}</strong>
                            <span>{user.email || "No email"}</span>
                          </div>
                        </div>
                      </td>

                      <td>{user.phone || "Not provided"}</td>
                      <td>{user.location || "Not provided"}</td>

                      <td>
                        <select
                          value={user.role || "user"}
                          disabled={busyId === user._id}
                          onChange={(event) =>
                            updateRole(user._id, event.target.value)
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td>{formatDate(user.createdAt)}</td>

                      <td className="text-right">
                        <button
                          type="button"
                          className="admin-danger-button"
                          disabled={isCurrent || busyId === user._id}
                          onClick={() => deleteUser(user)}
                        >
                          {busyId === user._id ? "Working..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function PageHeader({ title, description, count }) {
  return (
    <header className="admin-page-header-row">
      <div>
        <span>Admin management</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <strong>{count}</strong>
    </header>
  );
}

function Messages({ message, error }) {
  return (
    <>
      {message && <div className="admin-alert success">{message}</div>}
      {error && <div className="admin-alert error">{error}</div>}
    </>
  );
}

function Loading() {
  return <div className="admin-loading">Loading...</div>;
}

function Empty({ text }) {
  return <div className="admin-empty-text">{text}</div>;
}

function formatDate(date) {
  return date
    ? new Date(date).toLocaleDateString("en-IN")
    : "Not available";
}

export default AdminUsers;