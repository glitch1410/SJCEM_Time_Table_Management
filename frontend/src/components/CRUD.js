import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/CRUD.css'; // Import your custom styles

const CRUDop = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'student',
    department: '', // Assuming this will be an ID of the department
    division: '',
    current_semester: null,
  });
  const [editUser, setEditUser] = useState(null);

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Handle input changes for new and edit user forms
  const handleInputChange = (e, setUser) => {
    const { name, value } = e.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Create a new user
  const handleAddUser = async () => {
    try {
      await axios.post('http://localhost:5000/users', newUser);
      fetchUsers(); // Refresh user list
      setNewUser({
        username: '',
        password: '',
        role: 'student',
        department: '',
        division: '',
        current_semester: null,
      });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Update an existing user
  const handleUpdateUser = async (username) => {
    try {
      await axios.put(`http://localhost:5000/users/${username}`, editUser);
      fetchUsers(); // Refresh user list
      setEditUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Delete a user with confirmation prompt
  const handleDeleteUser = (username) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      axios
        .delete(`http://localhost:5000/users/${username}`)
        .then(() => {
          fetchUsers(); // Refresh user list
        })
        .catch((error) => {
          console.error('Error deleting user:', error);
        });
    }
  };

  // Segregate faculty and students, exclude admins
  const facultyUsers = users.filter((user) => user.role === 'faculty');
  const studentUsers = users.filter((user) => user.role === 'student');

  return (
    <div className='container'>
      <div className="admin-dashboard">
        <h1>Admin Dashboard - User Management</h1>

        {/* Add New User Form */}
        <div className="admin-dashboard__form">
          <h2>Add New User</h2>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => handleInputChange(e, setNewUser)}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => handleInputChange(e, setNewUser)}
          />
          <select
            name="role"
            value={newUser.role}
            onChange={(e) => handleInputChange(e, setNewUser)}
          >
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
          </select>
          <input
            type="number"
            name="department"
            placeholder="Department ID" // Assuming this is an integer ID
            value={newUser.department}
            onChange={(e) => handleInputChange(e, setNewUser)}
          />
          <input
            type="text"
            name="division"
            placeholder="Division"
            value={newUser.division}
            onChange={(e) => handleInputChange(e, setNewUser)}
          />
          <input
            type="number"
            name="current_semester"
            placeholder="Semester"
            value={newUser.current_semester || ''}
            onChange={(e) => handleInputChange(e, setNewUser)}
          />
          <button onClick={handleAddUser}>Add User</button>
        </div>

        {/* Faculty List */}
        <div className="admin-dashboard__user-list admin-dashboard__section">
          <h2 className="admin-dashboard__heading">Faculty</h2>
          <ul>
            {facultyUsers.map((user) => (
              <li key={user.username}>
                <strong>{user.username}</strong> - {user.department} - {user.division}
                <button
                  className="admin-dashboard__edit-btn"
                  onClick={() => setEditUser(user)}
                >
                  Edit
                </button>
                <button
                  className="admin-dashboard__delete-btn"
                  onClick={() => handleDeleteUser(user.username)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Student List */}
        <div className="admin-dashboard__user-list admin-dashboard__section">
          <h2 className="admin-dashboard__heading">Students</h2>
          <ul>
            {studentUsers.map((user) => (
              <li key={user.username}>
                <strong>{user.username}</strong> - {user.department} - {user.division}
                <button
                  className="admin-dashboard__edit-btn"
                  onClick={() => setEditUser(user)}
                >
                  Edit
                </button>
                <button
                  className="admin-dashboard__delete-btn"
                  onClick={() => handleDeleteUser(user.username)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Edit User Form */}
        {editUser && (
          <div className="admin-dashboard__form">
            <h2>Edit User - {editUser.username}</h2>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={editUser.password}
              onChange={(e) => handleInputChange(e, setEditUser)}
            />
            <select
              name="role"
              value={editUser.role}
              onChange={(e) => handleInputChange(e, setEditUser)}
            >
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
            <input
              type="number"
              name="department"
              placeholder="Department ID" // Assuming this is an integer ID
              value={editUser.department}
              onChange={(e) => handleInputChange(e, setEditUser)}
            />
            <input
              type="text"
              name="division"
              placeholder="Division"
              value={editUser.division}
              onChange={(e) => handleInputChange(e, setEditUser)}
            />
            <input
              type="number"
              name="current_semester"
              placeholder="Semester"
              value={editUser.current_semester || ''}
              onChange={(e) => handleInputChange(e, setEditUser)}
            />
            <button onClick={() => handleUpdateUser(editUser.username)}>Save</button>
            <button
              className="admin-dashboard__cancel-btn"
              onClick={() => setEditUser(null)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRUDop;
