"use client";

import { useState, useEffect } from "react";
import { FiClock, FiCheck, FiX, FiCalendar, FiTrash2 } from "react-icons/fi";
import Modal from "../../components/Modal";
import { requestApprovalApi } from "../../api/requestApprovalApi";
import Loader from "./Loader";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestApprovalApi.getMyRequests();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch your requests");
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleDeleteRequest = async (requestId) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      setLoading(true);
      const response = await requestApprovalApi.deleteRequest(requestId);
      if (response.success) {
        alert(response.message || "Request deleted successfully");
        await fetchMyRequests();
      }
    } catch (err) {
      alert(err.message || "Failed to delete request");
      console.error("Error deleting request:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: <FiClock className="inline mr-1" />,
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: <FiCheck className="inline mr-1" />,
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: <FiX className="inline mr-1" />,
      },
    };
    return badges[status] || badges.pending;
  };

  const getRequestTypeLabel = (type) => {
    const labels = {
      create_project: "Create Project",
      edit_project: "Edit Project",
      create_sales_invoice: "Create Sales Invoice",
      edit_sales_invoice: "Edit Sales Invoice",
      create_cash_payment: "Create Cash Payment",
      edit_cash_payment: "Edit Cash Payment",
      create_bank_payment: "Create Bank Payment",
      edit_bank_payment: "Edit Bank Payment",
      create_purchase: "Create Purchase",
      edit_purchase: "Edit Purchase",
      create_plot: "Create Plot",
      edit_plot: "Edit Plot",
      create_customer: "Create Customer",
      edit_customer: "Edit Customer",
      create_supplier: "Create Supplier",
      edit_supplier: "Edit Supplier",
      create_user: "Create User",
      edit_user: "Edit User",
    };
    return labels[type] || type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getPendingCount = () => {
    return requests.filter((req) => req.status === "pending").length;
  };

  const getApprovedCount = () => {
    return requests.filter((req) => req.status === "approved").length;
  };

  const getRejectedCount = () => {
    return requests.filter((req) => req.status === "rejected").length;
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Requests</h1>
        <p className="text-muted-foreground">
          View the status of your project creation and edit requests
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Requests
              </p>
              <p className="text-2xl font-bold text-foreground">
                {requests.length}
              </p>
            </div>
            <FiCalendar className="text-muted-foreground text-3xl" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-500 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-foreground">
                {getPendingCount()}
              </p>
            </div>
            <FiClock className="text-yellow-500 text-3xl" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-500 text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold text-foreground">
                {getApprovedCount()}
              </p>
            </div>
            <FiCheck className="text-green-500 text-3xl" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-500 text-sm font-medium">Rejected</p>
              <p className="text-2xl font-bold text-foreground">
                {getRejectedCount()}
              </p>
            </div>
            <FiX className="text-red-500 text-3xl" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Requests List */}
      <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-lg mb-2">No requests found</p>
            <p className="text-sm">
              Your project creation and edit requests will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Request Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {requests.map((request) => {
                  const statusBadge = getStatusBadge(request.status);
                  return (
                    <tr key={request._id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-foreground">
                          {getRequestTypeLabel(request.requestType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.projectId ? (
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {request.projectId.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Code: {request.projectId.code}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-foreground">
                            {request.requestData?.name || "New Project"}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          {statusBadge.icon}
                          {request.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <FiCalendar className="mr-2" />
                          {formatDate(request.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="text-primary hover:text-primary/80"
                          >
                            View Details
                          </button>
                          {(request.status === "pending" ||
                            request.status === "rejected") && (
                            <button
                              onClick={() => handleDeleteRequest(request._id)}
                              className="text-red-500 hover:text-red-400 ml-2"
                            >
                              <FiTrash2 className="inline mr-1" />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Request Details"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Request Type
                </label>
                <p className="text-foreground">
                  {getRequestTypeLabel(selectedRequest.requestType)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Status
                </label>
                {(() => {
                  const statusBadge = getStatusBadge(selectedRequest.status);
                  return (
                    <span
                      className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                    >
                      {statusBadge.icon}
                      {selectedRequest.status.toUpperCase()}
                    </span>
                  );
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Submitted On
                </label>
                <p className="text-foreground">
                  {formatDate(selectedRequest.createdAt)}
                </p>
              </div>
              {selectedRequest.approvedAt && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {selectedRequest.status === "approved"
                      ? "Approved"
                      : "Rejected"}{" "}
                    On
                  </label>
                  <p className="text-foreground">
                    {formatDate(selectedRequest.approvedAt)}
                  </p>
                </div>
              )}
              {selectedRequest.approvedBy && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Processed By
                  </label>
                  <p className="text-foreground">
                    {selectedRequest.approvedBy.name} (
                    {selectedRequest.approvedBy.email})
                  </p>
                </div>
              )}
            </div>

            {selectedRequest.adminResponse && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Admin Response
                </label>
                <div
                  className={`p-3 rounded border ${
                    selectedRequest.status === "approved"
                      ? "bg-green-500/10 border-green-500"
                      : "bg-red-500/10 border-red-500"
                  }`}
                >
                  <p className="text-foreground">
                    {selectedRequest.adminResponse}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Project Details
              </label>
              <div className="bg-muted p-4 rounded border border-border max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {Object.entries(selectedRequest.requestData).map(
                    ([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-medium text-muted-foreground w-40">
                          {key}:
                        </span>
                        <span className="text-foreground flex-1">
                          {typeof value === "boolean"
                            ? value
                              ? "Yes"
                              : "No"
                            : value?.toString() || "N/A"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
