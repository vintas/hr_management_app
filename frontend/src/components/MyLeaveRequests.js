import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyLeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:5000/my-leave-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLeaveRequests(response.data);
      } catch (err) {
        setError("Failed to fetch leave requests");
        console.error(err);
      }
    };
    fetchLeaveRequests();
  }, []);

  const handleApplyLeave = () => {
    navigate("/request-leave"); // Navigate to the Apply Leave form page
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>My Leave Requests</h2>
      {error && <p style={styles.error}>{error}</p>}
      <button style={styles.button} onClick={handleApplyLeave}>
        Apply for Leave
      </button>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.length === 0 ? (
            <tr>
              <td colSpan="4" style={styles.noData}>
                No leave requests found.
              </td>
            </tr>
          ) : (
            leaveRequests.map((leave) => (
              <tr key={leave.id}>
                <td>{leave.start_date}</td>
                <td>{leave.end_date}</td>
                <td>{leave.reason}</td>
                <td>{leave.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  error: {
    color: "red",
    marginBottom: "10px",
    textAlign: "center",
  },
  button: {
    display: "block",
    margin: "0 auto 20px",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  tableHeader: {
    backgroundColor: "#007BFF",
    color: "#fff",
  },
  noData: {
    textAlign: "center",
    padding: "10px",
    fontSize: "16px",
    color: "#555",
  },
};

export default MyLeaveRequests;
