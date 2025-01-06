import React, { useState, useEffect } from "react";
import axios from "axios";

const LeaveApprovalPage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:5000/leave-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch leave requests", error);
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
    } catch (error) {
      console.error("Failed to update leave request", error);
    }
  };

  return (
    <div>
      <h2>Leave Approval</h2>
      <table>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
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
                {request.status === "Pending" && (
                  <>
                    <button onClick={() => handleUpdate(request.id, "Approved")}>
                      Approve
                    </button>
                    <button onClick={() => handleUpdate(request.id, "Rejected")}>
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveApprovalPage;
