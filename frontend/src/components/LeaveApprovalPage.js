import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const LeaveApprovalPage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:5000/leave-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(response.data || []);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };
    fetchLeaveRequests();
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://127.0.0.1:5000/leave-request/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status } : req
        )
      );
      setMessage(`Leave request ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error("Failed to update leave request", error);
      setMessage("Failed to update leave request.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <h2 className="text-center mb-4">Approve Leave Requests</h2>
        {message && <div className="alert alert-info">{message}</div>}
        {leaveRequests.length === 0 ? (
          <p className="text-center">No leave requests to display.</p>
        ) : (
          <table className="table table-striped table-hover">
            <thead className="thead-dark">
              <tr>
                <th scope="col">Employee Name</th>
                <th scope="col">Start Date</th>
                <th scope="col">End Date</th>
                <th scope="col">Reason</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.employee_name}</td>
                  <td>{request.start_date}</td>
                  <td>{request.end_date}</td>
                  <td>{request.reason}</td>
                  <td>{request.status}</td>
                  <td>
                    {request.status === "Pending" ? (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleUpdate(request.id, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleUpdate(request.id, "Rejected")}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-muted">No actions available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeaveApprovalPage;
