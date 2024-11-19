import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditEmployee = () => {
  const { id } = useParams(); // Get the employee ID from the URL
  const navigate = useNavigate();

  const [employeeData, setEmployeeData] = useState({
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

  // Fetch employee details
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch employee data");
        }
        const data = await response.json();
        setEmployeeData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData({ ...employeeData, [name]: value });
  };

  // Submit updated data
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/employees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        throw new Error("Failed to update employee data");
      }

      // Navigate back to HR dashboard after successful update
      navigate("/hr-dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Edit Employee</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={employeeData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Date of Birth:</label>
          <input
            type="date"
            name="dob"
            value={employeeData.dob}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Joining Date:</label>
          <input
            type="date"
            name="joining_date"
            value={employeeData.joining_date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Education:</label>
          <input
            type="text"
            name="education"
            value={employeeData.education}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Department:</label>
          <input
            type="text"
            name="department"
            value={employeeData.department}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Role:</label>
          <input
            type="text"
            name="role"
            value={employeeData.role}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Salary:</label>
          <input
            type="number"
            name="salary"
            value={employeeData.salary}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Update Employee</button>
      </form>
    </div>
  );
};

export default EditEmployee;
