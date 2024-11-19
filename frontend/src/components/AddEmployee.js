import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "./Navbar";
import { Form, Button, Container, Alert } from "react-bootstrap";

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    joining_date: "",
    education: "",
    department: "",
    role: "",
    salary: "",
    is_hr: false,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [employeeCredentials, setEmployeeCredentials] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setEmployeeCredentials(null);

    try {
      const response = await fetch(`/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add employee");
      }

      const data = await response.json();
      setSuccessMessage("Employee added successfully!");
      setEmployeeCredentials({
        username: data.username,
        password: data.default_password,
        role: data.role,
      });
    } catch (err) {
      console.error(err);
      setError("Error adding employee. Please try again.");
    }
  };

  return (
    <div>
      <AppNavbar />
      <Container>
        <h1>Add Employee</h1>
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        {employeeCredentials && (
          <Alert variant="info">
            <p>
              <strong>Employee Credentials:</strong>
            </p>
            <p>
              <strong>Username:</strong> {employeeCredentials.username}
            </p>
            <p>
              <strong>Default Password:</strong> {employeeCredentials.password}
            </p>
            <p>
              <strong>Role:</strong> {employeeCredentials.role}
            </p>
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="dob" className="mt-3">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="joining_date" className="mt-3">
            <Form.Label>Joining Date</Form.Label>
            <Form.Control
              type="date"
              name="joining_date"
              value={formData.joining_date}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="education" className="mt-3">
            <Form.Label>Education</Form.Label>
            <Form.Control
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="department" className="mt-3">
            <Form.Label>Department</Form.Label>
            <Form.Control
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="role" className="mt-3">
            <Form.Label>Role</Form.Label>
            <Form.Control
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="salary" className="mt-3">
            <Form.Label>Salary</Form.Label>
            <Form.Control
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="is_hr" className="mt-3">
            <Form.Check
              type="checkbox"
              label="Is HR?"
              name="is_hr"
              checked={formData.is_hr}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="mt-4">
            Add Employee
          </Button>
          <Button
            variant="secondary"
            className="mt-4 ms-3"
            onClick={() => navigate("/hr-dashboard")}
          >
            Back to Dashboard
          </Button>
        </Form>
      </Container>
    </div>
  );
};

export default AddEmployee;
