import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HRDashboard from "./components/HRDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";
import AddEmployee from "./components/AddEmployee";
import EditEmployee from "./components/EditEmployee";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ApprovalPage from "./components/ApprovalPage";
import Home from "./components/Home";
import LeaveRequestForm from "./components/LeaveRequestForm";
import LeaveApprovalPage from "./components/LeaveApprovalPage";
import MyLeaveRequests from "./components/MyLeaveRequests";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/approval" element={<ApprovalPage />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/add-employee" element={<AddEmployee />} />
        <Route path="/edit-employee/:id" element={<EditEmployee />} />
        <Route path="/request-leave" element={<LeaveRequestForm />} />
        <Route path="/approve-leave" element={<LeaveApprovalPage />} />
        <Route path="/my-leaves" element={<MyLeaveRequests />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
