import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const HRDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`/employees`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }

        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <div>
      <h1>HR Dashboard</h1>
      <button
        onClick={() => navigate("/add-employee")}
        className="btn btn-primary"
      >
        Add Employee
      </button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.name}</td>
              <td>{employee.role}</td>
              <td>{employee.department}</td>
              <td>
                <Link to={`/edit-employee/${employee.id}`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HRDashboard;
