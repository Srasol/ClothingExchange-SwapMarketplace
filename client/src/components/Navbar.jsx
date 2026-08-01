import { NavLink, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import "./../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();

  // Get logged-in user
  const user = JSON.parse(localStorage.getItem("user"));

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar shadow">
  <div className="container">
    <NavLink
      className="navbar-brand fw-bold"
      to="/dashboard"
    >
      🧥 Clothing Exchange
    </NavLink>

    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarContent"
      aria-controls="navbarContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon" />
    </button>
        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarContent">

          <ul className="navbar-nav mx-auto">

            <li className="nav-item">
              <NavLink className="nav-link" to="/dashboard">
                Dashboard
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/listings">
                Listings
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/add-listing">
                Add Listing
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/swap-requests">
                Swaps
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/chat">
                Chat
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/profile">
                Profile
              </NavLink>
            </li>

          </ul>

          {/* Right Side */}
         <div className="navbar-user-section">
  <NotificationBell />

  <span className="navbar-user-name">
    <i className="bi bi-person-circle me-1"></i>
    {user?.name || "User"}
  </span>

  <button
    type="button"
    className="btn btn-danger btn-sm navbar-logout-button"
    onClick={logout}
  >
    <i className="bi bi-box-arrow-right me-1"></i>
    Logout
  </button>
</div>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;