import React, { useState, useEffect } from "react";
import { Container, Table, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AppNavbar from "./Navbar";

const HRDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/employees", {
          method: "GET",
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
        setError(err.message);
      }
    };

    fetchEmployees();
  }, []);

  const deleteEmployee = async (employeeId) => {
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/delete_employee/${employeeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      setEmployees((prevEmployees) =>
        prevEmployees.filter((employee) => employee.id !== employeeId)
      );
      setSuccessMessage("Employee deleted successfully!");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div>
      <AppNavbar />
      <Container>
        <h1>HR Dashboard</h1>
        <Button
          onClick={() => navigate("/add-employee")}
          className="mb-3"
          variant="primary"
        >
          Add Employee
        </Button>
        <Button
          variant="info"
          className="mt-4 ms-3"
          onClick={() => navigate("/approval")}
        >
          Pending Employee Approvals
        </Button>
        <Button
          variant="info"
          className="mt-4 ms-3"
          onClick={() => navigate("/approve-leave")}
        >
          Pending Leave Approvals
        </Button>


        {error && <Alert variant="danger">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.id}</td>
                <td>{employee.name}</td>
                <td>{employee.role}</td>
                <td>{employee.department}</td>
                <td>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/edit-employee/${employee.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    className="ms-2"
                    onClick={() => deleteEmployee(employee.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </div>
  );
};

export default HRDashboard;
