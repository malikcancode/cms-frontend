"use client";

import { useState, useEffect } from "react";
import { FiCheck, FiX, FiClock, FiUser, FiCalendar } from "react-icons/fi";
import Modal from "../../components/Modal";
import { requestApprovalApi } from "../../api/requestApprovalApi";
import Loader from "./Loader";

export default function AdminRequestApprovals() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseAction, setResponseAction] = useState(null); // 'approve' or 'reject'
  const [adminResponse, setAdminResponse] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  useEffect(() => {
    filterRequestsByStatus();
  }, [filterStatus, requests]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await requestApprovalApi.getAllRequests();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch requests");
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await requestApprovalApi.getRequestStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const filterRequestsByStatus = () => {
    if (filterStatus === "all") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(
        requests.filter((req) => req.status === filterStatus)
      );
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setResponseAction("approve");
    setAdminResponse("");
    setShowResponseModal(true);
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setResponseAction("reject");
    setAdminResponse("");
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();

    if (responseAction === "reject" && !adminResponse.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setLoading(true);
      const response =
        responseAction === "approve"
          ? await requestApprovalApi.approveRequest(
              selectedRequest._id,
              adminResponse
            )
          : await requestApprovalApi.rejectRequest(
              selectedRequest._id,
              adminResponse
            );

      if (response.success) {
        alert(response.message);
        setShowResponseModal(false);
        setAdminResponse("");
        await fetchRequests();
        await fetchStats();
      }
    } catch (err) {
      alert(err.message || `Failed to ${responseAction} request`);
      console.error(`Error ${responseAction}ing request:`, err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
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
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Request Approvals
        </h1>
        <p className="text-muted-foreground">
          Review and manage project creation and edit requests from users
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-500 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.pending}
              </p>
            </div>
            <FiClock className="text-yellow-500 text-3xl" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-500 text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.approved}
              </p>
            </div>
            <FiCheck className="text-green-500 text-3xl" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-500 text-sm font-medium">Rejected</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.rejected}
              </p>
            </div>
            <FiX className="text-red-500 text-3xl" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary text-sm font-medium">Total</p>
              <p className="text-2xl font-bold text-foreground">
                {stats.total}
              </p>
            </div>
            <FiUser className="text-primary text-3xl" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilterStatus("pending")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-card text-foreground border border-border hover:bg-muted"
          }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilterStatus("approved")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "approved"
              ? "bg-green-500 text-white"
              : "bg-card text-foreground border border-border hover:bg-muted"
          }`}
        >
          Approved ({stats.approved})
        </button>
        <button
          onClick={() => setFilterStatus("rejected")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "rejected"
              ? "bg-red-500 text-white"
              : "bg-card text-foreground border border-border hover:bg-muted"
          }`}
        >
          Rejected ({stats.rejected})
        </button>
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground border border-border hover:bg-muted"
          }`}
        >
          All ({stats.total})
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Requests Table */}
      <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
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
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-muted-foreground"
                  >
                    No requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {request.userId?.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.userId?.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Role: {request.userId?.role}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">
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
                        <span className="text-sm text-foreground">
                          {request.requestData?.name || "New Project"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          request.status
                        )}`}
                      >
                        {request.status}
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
                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveClick(request)}
                              className="text-green-500 hover:text-green-400 ml-2"
                            >
                              <FiCheck className="inline mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectClick(request)}
                              className="text-red-500 hover:text-red-400 ml-2"
                            >
                              <FiX className="inline mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                  Requested By
                </label>
                <p className="text-foreground">
                  {selectedRequest.userId?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.userId?.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  User Role
                </label>
                <p className="text-foreground">
                  {selectedRequest.userId?.role}
                </p>
              </div>
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
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                    selectedRequest.status
                  )}`}
                >
                  {selectedRequest.status}
                </span>
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
            </div>

            {selectedRequest.adminResponse && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Admin Response
                </label>
                <p className="text-foreground bg-muted p-3 rounded border border-border">
                  {selectedRequest.adminResponse}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Request Details
              </label>
              <div className="bg-muted p-4 rounded border border-border space-y-4">
                {/* Basic Information */}
                {selectedRequest.requestData.date && (
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Date:
                    </span>
                    <span className="text-sm text-foreground">
                      {new Date(
                        selectedRequest.requestData.date
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {selectedRequest.requestData.project && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Project ID:
                    </span>
                    <span className="text-sm text-foreground ml-2">
                      {selectedRequest.requestData.project}
                    </span>
                  </div>
                )}

                {selectedRequest.requestData.jobDescription && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Description:
                    </span>
                    <p className="text-sm text-foreground mt-1 bg-background p-2 rounded">
                      {selectedRequest.requestData.jobDescription}
                    </p>
                  </div>
                )}

                {selectedRequest.requestData.remarks && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Remarks:
                    </span>
                    <p className="text-sm text-foreground mt-1 bg-background p-2 rounded">
                      {selectedRequest.requestData.remarks}
                    </p>
                  </div>
                )}

                {selectedRequest.requestData.employeeRef && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Employee Reference:
                    </span>
                    <span className="text-sm text-foreground ml-2">
                      {selectedRequest.requestData.employeeRef}
                    </span>
                  </div>
                )}

                {/* Payment Lines / Line Items */}
                {selectedRequest.requestData.paymentLines &&
                  selectedRequest.requestData.paymentLines.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2">
                        Payment Lines
                      </h4>
                      <div className="space-y-2">
                        {selectedRequest.requestData.paymentLines.map(
                          (line, index) => (
                            <div
                              key={index}
                              className="bg-background p-3 rounded border border-border"
                            >
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {line.accountCode && (
                                  <div>
                                    <span className="font-medium text-muted-foreground">
                                      Account Code:
                                    </span>
                                    <span className="text-foreground ml-2">
                                      {line.accountCode}
                                    </span>
                                  </div>
                                )}
                                {line.accountName && (
                                  <div>
                                    <span className="font-medium text-muted-foreground">
                                      Account Name:
                                    </span>
                                    <span className="text-foreground ml-2">
                                      {line.accountName}
                                    </span>
                                  </div>
                                )}
                                {line.description && (
                                  <div className="col-span-2">
                                    <span className="font-medium text-muted-foreground">
                                      Description:
                                    </span>
                                    <span className="text-foreground ml-2">
                                      {line.description}
                                    </span>
                                  </div>
                                )}
                                {line.amount !== undefined && (
                                  <div className="col-span-2">
                                    <span className="font-medium text-muted-foreground">
                                      Amount:
                                    </span>
                                    <span className="text-foreground ml-2 font-semibold">
                                      Rs. {line.amount.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Display other fields dynamically */}
                {Object.keys(selectedRequest.requestData).length > 0 && (
                  <div className="mt-4">
                    {Object.entries(selectedRequest.requestData).map(
                      ([key, value]) => {
                        // Skip already displayed fields
                        if (
                          [
                            "date",
                            "project",
                            "jobDescription",
                            "remarks",
                            "employeeRef",
                            "paymentLines",
                          ].includes(key)
                        ) {
                          return null;
                        }

                        // Skip empty values
                        if (
                          value === "" ||
                          value === null ||
                          value === undefined
                        ) {
                          return null;
                        }

                        // Handle arrays
                        if (Array.isArray(value) && value.length === 0) {
                          return null;
                        }

                        // Handle objects (but not arrays or dates)
                        if (
                          typeof value === "object" &&
                          value !== null &&
                          !Array.isArray(value)
                        ) {
                          return (
                            <div key={key} className="mb-2">
                              <span className="text-sm font-medium text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}:
                              </span>
                              <pre className="text-xs text-foreground mt-1 bg-background p-2 rounded overflow-x-auto">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            </div>
                          );
                        }

                        // Handle primitive values
                        return (
                          <div key={key} className="mb-2">
                            <span className="text-sm font-medium text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span className="text-sm text-foreground ml-2">
                              {String(value)}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title={
          responseAction === "approve" ? "Approve Request" : "Reject Request"
        }
      >
        <form onSubmit={handleSubmitResponse}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {responseAction === "approve"
                ? "Admin Note (Optional)"
                : "Reason for Rejection (Required)"}
            </label>
            <textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              rows="4"
              placeholder={
                responseAction === "approve"
                  ? "Enter any notes or comments..."
                  : "Enter the reason for rejection..."
              }
              required={responseAction === "reject"}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowResponseModal(false)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white ${
                responseAction === "approve"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : responseAction === "approve"
                ? "Approve"
                : "Reject"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
