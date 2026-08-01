import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/users");

      setUsers(
        Array.isArray(response.data)
          ? response.data
          : response.data?.users || []
      );
    } catch (err) {
      console.error("Load admin users error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue) ||
        user.phone?.toLowerCase().includes(searchValue) ||
        user.location?.toLowerCase().includes(searchValue) ||
        user.role?.toLowerCase().includes(searchValue)
      );
    });
  }, [users, search]);

  const updateUserRole = async (userId, role) => {
    try {
      setUpdatingId(userId);
      setError("");
      setSuccess("");

      const response = await API.put(
        `/admin/users/${userId}/role`,
        { role }
      );

      const updatedUser =
        response.data?.user || response.data;

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                ...updatedUser,
                role: updatedUser.role || role,
              }
            : user
        )
      );

      setSuccess(
        response.data?.message ||
          "User role updated successfully."
      );
    } catch (err) {
      console.error("Update user role error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update user role."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name?.trim() || "this user"}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user._id);
      setError("");
      setSuccess("");

      const response = await API.delete(
        `/admin/users/${user._id}`
      );

      setUsers((previousUsers) =>
        previousUsers.filter(
          (item) => item._id !== user._id
        )
      );

      setSuccess(
        response.data?.message ||
          "User deleted successfully."
      );
    } catch (err) {
      console.error("Delete user error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete user."
      );
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 bg-dark text-white min-vh-100 p-3">
          <h3 className="text-center mb-4">
            Admin
          </h3>

          <div className="list-group">
            <Link
              to="/admin"
              className="list-group-item list-group-item-action"
            >
              Dashboard
            </Link>

            <Link
              to="/admin/users"
              className="list-group-item list-group-item-action active"
            >
              Users
            </Link>

            <Link
              to="/admin/listings"
              className="list-group-item list-group-item-action"
            >
              Listings
            </Link>

            <Link
              to="/admin/swaps"
              className="list-group-item list-group-item-action"
            >
              Swaps
            </Link>
          </div>
        </div>

        <div className="col-md-10 p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                Manage Users
              </h2>

              <p className="text-muted mb-0">
                View, search, change roles and delete registered users.
              </p>
            </div>

            <span className="badge bg-primary fs-6 mt-2 mt-md-0">
              Total: {users.length}
            </span>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-7">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, email, phone, location or role"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />
                </div>

                <div className="col-md-5 text-md-end mt-2 mt-md-0">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={loadUsers}
                    disabled={loading}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  />

                  <p className="mt-2 mb-0">
                    Loading users...
                  </p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="alert alert-info mb-0">
                  No users found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map(
                        (user, index) => (
                          <tr key={user._id}>
                            <td>{index + 1}</td>

                            <td>
                              {user.name?.trim() ||
                                "Unknown"}
                            </td>

                            <td>{user.email}</td>

                            <td>
                              {user.phone ||
                                "Not provided"}
                            </td>

                            <td>
                              {user.location ||
                                "Not provided"}
                            </td>

                            <td style={{ minWidth: "130px" }}>
                              <select
                                className="form-select form-select-sm"
                                value={user.role || "user"}
                                disabled={
                                  updatingId === user._id
                                }
                                onChange={(event) =>
                                  updateUserRole(
                                    user._id,
                                    event.target.value
                                  )
                                }
                              >
                                <option value="user">
                                  User
                                </option>

                                <option value="admin">
                                  Admin
                                </option>
                              </select>

                              {updatingId === user._id && (
                                <small className="text-muted">
                                  Updating...
                                </small>
                              )}
                            </td>

                            <td>
                              {user.createdAt
                                ? new Date(
                                    user.createdAt
                                  ).toLocaleDateString()
                                : "Unknown"}
                            </td>

                            <td>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  deleteUser(user)
                                }
                                disabled={
                                  deletingId === user._id ||
                                  updatingId === user._id
                                }
                              >
                                {deletingId === user._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;