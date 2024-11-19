import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to login
      return;
    }

    // Check if the user is HR or an employee
    fetch("/user/role", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user role");
        }
        return response.json();
      })
      .then((data) => {
        if (data.is_hr) {
          navigate("/hr-dashboard");
        } else {
          navigate("/employee-dashboard");
        }
      })
      .catch((err) => {
        console.error(err);
        navigate("/"); // Redirect to login on error
      });
  }, [navigate]);

  return null;
};

export default Home;
