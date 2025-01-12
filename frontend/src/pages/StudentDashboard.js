import React, { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import { useNavigate } from 'react-router-dom';
import StudentNotification from '../components/StudentNotification';
import StudentTimetable from '../components/StudentTimetable'; // Timetable component
import axios from 'axios';

const StudentDashboard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [timetableData, setTimetableData] = useState(null);
  const [activeComponent, setActiveComponent] = useState('timetable'); // Manages which component to show
  const [notificationCount, setNotificationCount] = useState(0); // State for notification count
  const navigate = useNavigate();

  const fetchTimetableData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/timetable');
      setTimetableData(response.data); // Store fetched timetable data
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
    fetchTimetableData(); // Fetch timetable data on component mount
    fetchNotificationCount(); // Fetch notification count on component mount
  }, []);

  useEffect(() => {
    // Retrieve user details from localStorage
    const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
    if (storedUserDetails) {
      setUserDetails(storedUserDetails); // Set user details from localStorage
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');  // Remove the JWT token from localStorage
    navigate('/');  // Redirect to the login page
  };

  // Function to handle which component to show
  const renderComponent = () => {
    switch (activeComponent) {
      case 'notifications':
        return <StudentNotification fetchNotificationCount={fetchNotificationCount} />; // Pass the fetch function
      case 'timetable':
        return (
          userDetails && timetableData && (
            <StudentTimetable 
              userDetails={userDetails} 
              timetableData={timetableData} // Pass timetable data as prop
            />
          )
        );
      case 'logout':
        return <LogoutButton></LogoutButton>;
      default:
        return <p>Select an option from the navbar.</p>;
    }
  };

  return (
    <div className="container">
      <h1 className="text-center text-3xl font-bold">Student Dashboard</h1>

      {/* Navbar */}
      <nav className="navbar">
        <button onClick={() => setActiveComponent('timetable')}>Timetable</button>
        <button onClick={() => setActiveComponent('notifications')}>
          Notifications {notificationCount > 0 && `(${notificationCount})`} {/* Display notification count */}
        </button>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      {/* Render the selected component */}
      <div className="dashboard-content">
        {renderComponent()}
      </div>
    </div>
  );
};

export default StudentDashboard;
