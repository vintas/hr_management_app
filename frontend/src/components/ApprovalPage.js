import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ApprovalPage() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("/pending_approvals", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(response => {
            setPendingUsers(response.data);
        })
        .catch(error => {
            console.error("Error fetching pending approvals:", error);
        });
    }, []);

    const approveUser = (userId, updatedData) => {
        axios.put(`/approve_user/${userId}`, updatedData, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(() => {
            alert("User approved successfully!");
            setPendingUsers(pendingUsers.filter(user => user.id !== userId)); // Remove from pending list
            setSelectedUser(null);
        })
        .catch(error => {
            console.error("Error approving user:", error);
        });
    };

    return (
        <div>
            <h1>Approval Page</h1>
            <button onClick={() => navigate("/hr-dashboard")}>Back to Dashboard</button>
            {selectedUser ? (
                <div>
                    <h2>Approve User</h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const updatedData = {
                                name: e.target.name.value,
                                dob: e.target.dob.value,
                                education: e.target.education.value,
                                department: e.target.department.value,
                                role: e.target.role.value,
                                salary: parseFloat(e.target.salary.value),
                                joining_date: e.target.joining_date.value,
                            };
                            approveUser(selectedUser.id, updatedData);
                        }}
                    >
                        <input type="text" name="name" defaultValue={selectedUser.name || ""} placeholder="Name" required />
                        <input type="date" name="dob" defaultValue={selectedUser.dob || ""} placeholder="Date of Birth" required />
                        <input type="text" name="education" defaultValue={selectedUser.education || ""} placeholder="Education" required />
                        <input type="text" name="department" defaultValue={selectedUser.department || ""} placeholder="Department" />
                        <input type="text" name="role" defaultValue={selectedUser.role || ""} placeholder="Role" />
                        <input type="number" name="salary" defaultValue={selectedUser.salary || ""} placeholder="Salary" />
                        <input type="date" name="joining_date" defaultValue={selectedUser.joining_date || ""} placeholder="Joining Date" />
                        <button type="submit">Approve</button>
                    </form>
                    <button onClick={() => setSelectedUser(null)}>Cancel</button>
                </div>
            ) : (
                <div>
                    <h2>Pending Users</h2>
                    {pendingUsers.length === 0 ? (
                        <p>No users pending approval.</p>
                    ) : (
                        <ul>
                            {pendingUsers.map(user => (
                                <li key={user.id}>
                                    {user.username} - {user.name || "No name provided"}
                                    <button onClick={() => setSelectedUser(user)}>Approve</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default ApprovalPage;
