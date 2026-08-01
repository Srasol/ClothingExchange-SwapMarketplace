import { useEffect, useMemo, useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import API from "../services/api";

import LoadingSwap from "../components/swaps/LoadingSwap";
import EmptySwap from "../components/swaps/EmptySwap";
import SwapSearch from "../components/swaps/SwapSearch";
import SwapStatusFilter from "../components/swaps/SwapStatusFilter";
import SwapCard from "../components/swaps/SwapCard";
import PageHeader from "../components/PageHeader";

function SwapRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  })();

  const currentUserId = user?._id || user?.id || "";

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    if (!currentUserId) {
      setLoading(false);
      setError(
        "User information was not found. Please log in again."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        `/swaps/user/${currentUserId}`
      );

      setRequests(
        Array.isArray(response.data)
          ? response.data
          : response.data?.swaps || []
      );
    } catch (err) {
      console.error(
        "Load swap requests error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load swap requests."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      setError("");

      const response = await API.put(`/swaps/${id}`, {
        status,
      });

      const updatedSwap =
        response.data?.swap || response.data;

      setRequests((previousRequests) =>
        previousRequests.map((item) =>
          item._id === id
            ? {
                ...item,
                ...updatedSwap,
                status:
                  updatedSwap?.status || status,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Update swap request error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to update the swap request."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const isSender = (swap) => {
    const senderId =
      typeof swap.sender === "object"
        ? swap.sender?._id || swap.sender?.id
        : swap.sender;

    return String(senderId) === String(currentUserId);
  };

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((swap) => {
      const person = isSender(swap)
        ? swap.receiver?.name
        : swap.sender?.name;

      const matchesSearch =
        !query ||
        person?.toLowerCase().includes(query) ||
        swap.requestedItem?.title
          ?.toLowerCase()
          .includes(query) ||
        swap.offeredItem?.title
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        swap.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter, currentUserId]);

  if (loading) {
    return <LoadingSwap />;
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-7xl px-5">
        <PageHeader
          label="Swap Management"
          title="My Swap Requests"
          description="Track incoming and outgoing swap requests, review the offered items, and update each request status."
          icon={<FaExchangeAlt />}
          count={requests.length}
          countLabel={
            requests.length === 1
              ? "Request"
              : "Requests"
          }
        />

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>

              <button
                type="button"
                onClick={loadRequests}
                className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <SwapSearch
            search={search}
            setSearch={setSearch}
          />

          <SwapStatusFilter
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>

        {filteredRequests.length === 0 ? (
          <div className="mt-10">
            <EmptySwap />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {filteredRequests.map((swap) => (
              <SwapCard
                key={swap._id}
                swap={swap}
                user={user}
                updateStatus={updateStatus}
                updatingId={updatingId}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default SwapRequests;