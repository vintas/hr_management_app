import React, { useState, useEffect } from "react";

const EmployeeDashboard = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await fetch(`/employees/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch employee details");
        }

        const data = await response.json();
        setEmployeeData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Employee Dashboard</h1>
      <table>
        <tbody>
          <tr>
            <td><strong>Name:</strong></td>
            <td>{employeeData.name}</td>
          </tr>
          <tr>
            <td><strong>Date of Birth:</strong></td>
            <td>{employeeData.dob}</td>
          </tr>
          <tr>
            <td><strong>Joining Date:</strong></td>
            <td>{employeeData.joining_date}</td>
          </tr>
          <tr>
            <td><strong>Education:</strong></td>
            <td>{employeeData.education}</td>
          </tr>
          <tr>
            <td><strong>Department:</strong></td>
            <td>{employeeData.department}</td>
          </tr>
          <tr>
            <td><strong>Role:</strong></td>
            <td>{employeeData.role}</td>
          </tr>
          <tr>
            <td><strong>Salary:</strong></td>
            <td>{employeeData.salary}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeDashboard;
