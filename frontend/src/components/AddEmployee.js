import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

      alert("Employee added successfully!");
      navigate("/hr-dashboard");
    } catch (err) {
      console.error(err);
      alert("Error adding employee. Please try again.");
    }
  };

  return (
    <div>
      <h1>Add Employee</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Date of Birth:
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Joining Date:
          <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Education:
          <input type="text" name="education" value={formData.education} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Department:
          <input type="text" name="department" value={formData.department} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Role:
          <input type="text" name="role" value={formData.role} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Salary:
          <input type="number" name="salary" value={formData.salary} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Is HR:
          <input type="checkbox" name="is_hr" checked={formData.is_hr} onChange={handleChange} />
        </label>
        <br />
        <button type="submit" className="btn btn-primary">Add Employee</button>
      </form>
    </div>
  );
};

export default AddEmployee;
