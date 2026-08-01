import {
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Listings from "./pages/Listings";
import AddListing from "./pages/AddListing";
import ItemDetails from "./pages/ItemDetails";
import SwapRequests from "./pages/SwapRequests";
import Chat from "./pages/Chat";
import Negotiation from "./pages/Negotiation";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import ReviewForm from "./pages/ReviewForm";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminListings from "./pages/AdminListings";
import AdminSwaps from "./pages/AdminSwaps";
import AdminReviews from "./pages/AdminReviews";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminNotifications from "./pages/AdminNotifications";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/AdminLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/add-listing" element={<AddListing />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/swap-requests" element={<SwapRequests />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route
          path="/negotiation/:swapId"
          element={<Negotiation />}
        />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/review/:swapId"
          element={<ReviewForm />}
        />
      </Route>

      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route
          path="/admin/listings"
          element={<AdminListings />}
        />
        <Route path="/admin/swaps" element={<AdminSwaps />} />
        <Route
          path="/admin/reviews"
          element={<AdminReviews />}
        />
        <Route
          path="/admin/analytics"
          element={<AdminAnalytics />}
        />
        <Route
          path="/admin/notifications"
          element={<AdminNotifications />}
        />
        <Route
          path="/admin/reports"
          element={<AdminReports />}
        />
        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />
      </Route>
    </Routes>
  );
}

export default App;