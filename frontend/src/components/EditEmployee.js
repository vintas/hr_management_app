import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert } from "react-bootstrap";
import AppNavbar from "./Navbar"; // Import the navigation bar component

const EditEmployee = () => {
  const { id } = useParams(); // Get the employee ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    joining_date: "",
    education: "",
    department: "",
    role: "",
    salary: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch employee details on component mount
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch employee details");
        }

        const data = await response.json();
        setFormData({
          name: data.name || "",
          dob: data.dob || "",
          joining_date: data.joining_date || "",
          education: data.education || "",
          department: data.department || "",
          role: data.role || "",
          salary: data.salary || "",
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/employees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update employee details");
      }

      alert("Employee updated successfully!");
      navigate("/hr-dashboard");
    } catch (err) {
      console.error(err);
      alert("Error updating employee. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <AppNavbar /> {/* Add the navigation bar */}
      <Container>
        <h1>Edit Employee</h1>
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
            />
          </Form.Group>

          <Form.Group controlId="joining_date" className="mt-3">
            <Form.Label>Joining Date</Form.Label>
            <Form.Control
              type="date"
              name="joining_date"
              value={formData.joining_date}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="education" className="mt-3">
            <Form.Label>Education</Form.Label>
            <Form.Control
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="department" className="mt-3">
            <Form.Label>Department</Form.Label>
            <Form.Control
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="role" className="mt-3">
            <Form.Label>Role</Form.Label>
            <Form.Control
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group controlId="salary" className="mt-3">
            <Form.Label>Salary</Form.Label>
            <Form.Control
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="mt-4">
            Save Changes
          </Button>
        </Form>
      </Container>
    </div>
  );
};

export default EditEmployee;
