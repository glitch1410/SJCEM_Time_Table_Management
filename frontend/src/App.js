// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import TimetableCoordinatorDashboard from './pages/TimetableCoordinatorDashboard';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute component
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';

const Dashboard = ({ title }) => (
  <div className="flex justify-center items-center min-h-screen">
    <h1 className="text-4xl">{title}</h1>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route for login */}
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard title="Admin Dashboard" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faculty-dashboard" 
          element={
            <ProtectedRoute>
              <FacultyDashboard title="Faculty Dashboard" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coordinator-dashboard" 
          element={
            <ProtectedRoute>
              <TimetableCoordinatorDashboard title="Timetable Coordinator Dashboard" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student-dashboard" 
          element={
            <ProtectedRoute>
              <StudentDashboard title="Student Dashboard" />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
