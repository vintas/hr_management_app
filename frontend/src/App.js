import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import HRDashboard from './components/HRDashboard';
import EditEmployee from './components/EditEmployee';

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
              <Route path="/hr-dashboard" element={<HRDashboard />} />
              <Route path="/edit-employee/:id" element={<EditEmployee />} />
          </Routes>
      </Router>
  );
}

export default App;
