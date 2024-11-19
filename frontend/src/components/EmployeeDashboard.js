import React, { useState, useEffect } from "react";
import { Container, Card, Alert } from "react-bootstrap";
import AppNavbar from "./Navbar";

const EmployeeDashboard = () => {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await fetch("/employees/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch employee details");
        }

        const data = await response.json();
        setEmployeeDetails(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchEmployeeDetails();
  }, []);

  if (error) {
    return (
      <div>
        <AppNavbar />
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (!employeeDetails) {
    return (
      <div>
        <AppNavbar />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <AppNavbar />
      <Container>
        <h1>Employee Dashboard</h1>
        <Card className="mt-4">
          <Card.Body>
            <Card.Title>{employeeDetails.name}</Card.Title>
            <Card.Text>
              <strong>Date of Birth:</strong> {employeeDetails.dob}
            </Card.Text>
            <Card.Text>
              <strong>Joining Date:</strong> {employeeDetails.joining_date}
            </Card.Text>
            <Card.Text>
              <strong>Education:</strong> {employeeDetails.education}
            </Card.Text>
            <Card.Text>
              <strong>Department:</strong> {employeeDetails.department}
            </Card.Text>
            <Card.Text>
              <strong>Role:</strong> {employeeDetails.role}
            </Card.Text>
            <Card.Text>
              <strong>Salary:</strong> ${employeeDetails.salary}
            </Card.Text>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default EmployeeDashboard;
