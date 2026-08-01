import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: "📊" },
  { name: "Users", path: "/admin/users", icon: "👥" },
  { name: "Listings", path: "/admin/listings", icon: "👕" },
  { name: "Swaps", path: "/admin/swaps", icon: "🔄" },
  { name: "Reviews", path: "/admin/reviews", icon: "⭐" },
  { name: "Notifications", path: "/admin/notifications", icon: "🔔" },
];

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">
          Clothing Exchange
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <NavLink
          to="/dashboard"
          className="block rounded-lg bg-red-600 px-4 py-3 text-center font-medium hover:bg-red-700"
        >
          Back to User Dashboard
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;