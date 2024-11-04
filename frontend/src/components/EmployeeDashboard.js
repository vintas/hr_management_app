// src/components/EmployeeDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeeDashboard = () => {
    const [employee, setEmployee] = useState(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/employee-details`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployee(response.data);
        };

        fetchEmployee();
    }, []);

    return (
        <div>
            <h2>Employee Dashboard</h2>
            {employee ? (
                <div>
                    <p>Name: {employee.name}</p>
                    <p>Role: {employee.role}</p>
                    <p>Department: {employee.department}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default EmployeeDashboard;
