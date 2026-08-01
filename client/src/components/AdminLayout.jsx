import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import "../styles/admin.css";

function AdminLayout() {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const openSidebar = () => {
    setMobileOpen(true);
  };

  const closeSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div className="admin-shell">
      <AdminSidebar
        mobileOpen={mobileOpen}
        closeMobile={closeSidebar}
      />

      <div className="admin-shell-main">
        <button
          type="button"
          className="admin-mobile-menu-button"
          onClick={openSidebar}
          aria-label="Open admin menu"
        >
          ☰
        </button>

        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;