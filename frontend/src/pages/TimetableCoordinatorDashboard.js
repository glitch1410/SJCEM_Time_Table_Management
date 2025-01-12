import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Timetable from '../components/Timetable';
import GenerateTimetable from '../components/GenerateTimetable';
import LogoutButton from '../components/LogoutButton';
import MessagingDashboard from '../components/MessagingDashboard';

const TimetableCoordinatorDashboard = () => {
  const [timetableData, setTimetableData] = useState(null);
  const [activeComponent, setActiveComponent] = useState('timetable'); // Manages which component to show
  const [notificationCount, setNotificationCount] = useState(0); // State for notification count
  const navigate = useNavigate();

  // Fetch the timetable data from the backend
  const fetchTimetableData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/timetable');
      setTimetableData(response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get('http://localhost:5000/messages');
      setNotificationCount(response.data.length); // Set notification count based on fetched messages
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchTimetableData();
    fetchNotificationCount(); // Fetch notification count on component mount
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');  // Remove the JWT token from localStorage
    navigate('/');  // Redirect to the login page
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'generate':
        return <GenerateTimetable onGenerate={fetchTimetableData} />;
      case 'logout':
        return <LogoutButton />;
      case 'msg-dashboard':
        return <MessagingDashboard />;
      default:
        return timetableData && <Timetable timetableData={timetableData} />;
    }
  };

  return (
    <div className="container">
      <h1>Timetable Coordinator Dashboard</h1>

      {/* Navbar */}
      <nav className="navbar">
        <button onClick={() => setActiveComponent('timetable')}>Timetable</button>
        <button onClick={() => setActiveComponent('generate')}>Generate Timetable</button>
        <button onClick={() => setActiveComponent('msg-dashboard')}>Messages {notificationCount > 0 && `(${notificationCount})`}</button> {/* Display notification count */}
        <button onClick={handleLogout}>Logout</button>
      </nav>

      {/* Render the selected component */}
      <div className="dashboard-content">
        {renderComponent()}
      </div>
    </div>
  );
};

export default TimetableCoordinatorDashboard;
