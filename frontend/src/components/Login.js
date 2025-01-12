import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
	e.preventDefault();
  
	try {
	  const response = await fetch('http://localhost:5000/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
	  });
  
	  if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Login failed');
	  }
  
	  const data = await response.json();
	  if (data.token) {
		localStorage.setItem('token', data.token);
		localStorage.setItem('userDetails', JSON.stringify(data.userDetails));
  
		switch (data.role) {
		  case 'admin':
			navigate('/admin-dashboard');
			break;
		  case 'faculty':
			navigate('/faculty-dashboard');
			break;
		  case 'timetable_coordinator':
			navigate('/coordinator-dashboard');
			break;
		  case 'student':
			navigate('/student-dashboard');
			break;
		  default:
			break;
		}
	  } else {
		alert('No token received');
	  }
	} catch (err) {
	  console.error('Error logging in:', err);
	  alert('Login failed: ' + err.message);
	}
  };
  const handleLogin2 = async (e) => {
	e.preventDefault();
  
	try {
	  const response = await fetch('http://localhost:5000/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
	  });
  
	  console.log('Response:', response); // Debugging
  
	  if (response.ok) {
		const data = await response.json();
		console.log('Data:', data); // Debugging
	  } else {
		const errorData = await response.json();
		console.error('Error response:', errorData); // Debugging
		alert(errorData.message);
	  }
	} catch (err) {
	  console.error('Error logging in:', err);
	  alert('Server error. Please try again later.');
	}
  };
  
  

  return (
    <div className="main">
      <div className="login">
        <form onSubmit={handleLogin}>
          <label htmlFor="login">Login</label>
          <input 
            type="text" 
            name="username" 
            placeholder="Username" 
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password" 
            name="pswd" 
            placeholder="Password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
