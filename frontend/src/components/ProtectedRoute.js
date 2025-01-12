// src/components/ProtectedRoute.js
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');  // Retrieve the token
  const location = useLocation();

  useEffect(() => {
    const handlePopState = () => {
      // Clear the token if navigating away from a protected route
      localStorage.removeItem('token');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location]);

  if (!token) {
    return <Navigate to="/" />;  // Redirect to login if token is missing
  }

  return children;  // Render the protected component
};

export default ProtectedRoute;
