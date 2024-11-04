import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function EditEmployee() {
  const { id } = useParams(); // Get employee ID from the URL
  const [employee, setEmployee] = useState({
    name: '',
    dob: '',
    joining_date: '',
    education: '',
    department: '',
    role: '',
    salary: ''
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/employees/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
      } else {
        console.error("Failed to fetch employee details");
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prevEmployee) => ({ ...prevEmployee, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(employee)
    });

    if (response.ok) {
      alert("Employee details updated successfully!");
    } else {
      console.error("Failed to update employee details");
    }
  };

  return (
    <div>
      <h1>Edit Employee</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" name="name" value={employee.name} onChange={handleChange} />
        </label>
        <label>
          Department:
          <input type="text" name="department" value={employee.department} onChange={handleChange} />
        </label>
        <label>
          Role:
          <input type="text" name="role" value={employee.role} onChange={handleChange} />
        </label>
        <label>
          Salary:
          <input type="number" name="salary" value={employee.salary} onChange={handleChange} />
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default EditEmployee;
