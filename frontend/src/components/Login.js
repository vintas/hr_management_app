import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // State to track the error message
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      // Check if the message indicates the account is not approved
      if (data.message === "Account not approved by HR yet") {
        setError("Your account has not been approved by HR yet. Please wait for approval.");
      } else {
        if (!response.ok) {
          throw new Error("Login failed");
        }

        localStorage.setItem("token", data.token);
        // Redirect based on is_hr property
        if (data.is_hr) {
          navigate("/hr-dashboard");
        } else {
          navigate("/employee-dashboard");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Login
        </button>
      </form>
      {/* Show error popup if there is an error */}
      {error && (
        <div className="error-popup">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Close</button>
        </div>
      )}
      <Button variant="secondary" className="mt-4 ms-3" onClick={() => navigate("/signup")}>Create New Account</Button>
    </div>
  );
};

export default Login;
