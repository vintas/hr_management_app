import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function HRDashboard() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const token = localStorage.getItem('token'); // Retrieve JWT token

      const response = await fetch('http://localhost:5000/employees', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        console.error("Failed to fetch employees");
      }
    };

    fetchEmployees();
  }, []);

  return (
    <div>
      <h1>HR Dashboard</h1>
      <h2>Employee List</h2>
      <ul>
        {employees.map(employee => (
          <li key={employee.id}>
            <p>Name: {employee.name}</p>
            <p>Role: {employee.role}</p>
            <p>Department: {employee.department}</p>
            <Link to={`/edit-employee/${employee.id}`}>Edit</Link> {/* Link to edit page */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HRDashboard;
