import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HRDashboard from "./components/HRDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";
import AddEmployee from "./components/AddEmployee";
import EditEmployee from "./components/EditEmployee";
import Login from "./components/Login";
import Home from "./components/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/add-employee" element={<AddEmployee />} />
        <Route path="/edit-employee/:id" element={<EditEmployee />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
