import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EmployeeDetails() {
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/employees/1`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployee(res.data);
      }
    };
    fetchEmployee();
  }, []);

  if (!employee) return <p>Loading...</p>;

  return (
    <div>
      <h1>{employee.name}</h1>
      <p>Date of Birth: {employee.dob}</p>
      <p>Joining Date: {employee.joining_date}</p>
      <p>Education: {employee.education}</p>
      <p>Department: {employee.department}</p>
      <p>Role: {employee.role}</p>
      <p>Salary: {employee.salary}</p>
    </div>
  );
}

export default EmployeeDetails;
