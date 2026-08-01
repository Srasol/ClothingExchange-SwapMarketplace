import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaComments,
  FaExchangeAlt,
  FaPlus,
  FaSearch,
} from "react-icons/fa";

function QuickActions() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Add Listing",
      description: "Upload a clothing item",
      icon: <FaPlus />,
      path: "/add-listing",
    },
    {
      title: "Browse Items",
      description: "Discover available clothes",
      icon: <FaSearch />,
      path: "/listings",
    },
    {
      title: "Swap Requests",
      description: "Manage your requests",
      icon: <FaExchangeAlt />,
      path: "/swap-requests",
    },
    {
      title: "Open Chat",
      description: "Message other users",
      icon: <FaComments />,
      path: "/chat",
    },
  ];

  return (
    <section className="dashboard-quick-section">
      <div className="dashboard-section-heading">
        <div>
          <span>SHORTCUTS</span>
          <h2>Quick Actions</h2>
        </div>
      </div>

      <div className="dashboard-quick-grid">
        {quickActions.map((action) => (
          <button
            key={action.title}
            type="button"
            className="dashboard-quick-card"
            onClick={() => navigate(action.path)}
          >
            <div className="dashboard-quick-icon">
              {action.icon}
            </div>

            <div>
              <strong>{action.title}</strong>
              <span>{action.description}</span>
            </div>

            <FaArrowRight className="dashboard-quick-arrow" />
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;