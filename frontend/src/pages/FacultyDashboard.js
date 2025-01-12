import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import Timetable from '../components/Timetable';
import MessagingDashboard from '../components/MessagingDashboard';
import FacultyTimetable from '../components/FacultyTimetable';

const FacultyDashboard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [timetableData, setTimetableData] = useState(null);
  const [activeComponent, setActiveComponent] = useState('timetable');
  const [notificationCount, setNotificationCount] = useState(0); // State for notification count
  const navigate = useNavigate();

  const renderComponent = () => {
    switch (activeComponent) {
      case 'logout':
        return <LogoutButton />;
      case 'msg-dashboard':
        return <MessagingDashboard />;
      case 'personal-timetable':
        return (
          userDetails && timetableData && (
            <FacultyTimetable 
              userDetails={userDetails} 
              timetableData={timetableData} // Pass timetable data as prop
            />
          )
        );
      default:
        return timetableData && <Timetable timetableData={timetableData} />;
    }
  };

  useEffect(() => {
    // Retrieve user details from localStorage
    const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
    if (storedUserDetails) {
		setUserDetails(storedUserDetails); // Set user details from localStorage
		console.log(storedUserDetails)
    }
  }, []);

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
	  localStorage.removeItem('token'); // Remove the JWT token from localStorage
	  navigate('/'); // Redirect to the login page
  };

  return (
    <div className="container">
      <h1 className="text-center text-3xl font-bold">Faculty Dashboard</h1>
      
      {/* Display basic user details */}
      {userDetails && (
        <div className="user-details text-center mt-4">
          <p><strong>Role:</strong> {userDetails.role}</p>
          <p><strong>Username:</strong> {userDetails.username}</p>
          <p><strong>Department:</strong> {userDetails.department}</p>
        </div>
      )}
      
      <nav className="navbar">
        <button onClick={() => setActiveComponent('timetable')}>Timetable</button>
        <button onClick={() => setActiveComponent('personal-timetable')}>Personal Timetable</button>
        <button onClick={() => setActiveComponent('msg-dashboard')}>
          Messages {notificationCount > 0 && `(${notificationCount})`} {/* Display notification count */}
        </button>
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <div className="dashboard-content">
        {renderComponent()}
      </div>
    </div>
  );
};

export default FacultyDashboard;
