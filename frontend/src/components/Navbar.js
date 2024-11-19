import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Button } from "react-bootstrap";

const AppNavbar = () => {
  const navigate = useNavigate();

  const handleHome = async () => {
    try {
      const response = await fetch("/user/is_hr", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user role");
      }

      const data = await response.json();
      if (data.is_hr) {
        navigate("/hr-dashboard");
      } else {
        navigate("/employee-dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Error determining user role.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/"); // Redirect to login
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Navbar.Brand href="/">HR Management App</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link onClick={handleHome}>Home</Nav.Link>
        </Nav>
        <Button variant="outline-light" onClick={handleLogout}>
          Logout
        </Button>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default AppNavbar;
