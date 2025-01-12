import React from 'react';
import LogoutButton from '../components/LogoutButton';
import CRUDop from '../components/CRUD';

const AdminDashboard = () => {
  return (
    <div className="dashboard">
      <h1 className="text-center text-3xl font-bold">Admin Dashboard</h1>
	  <CRUDop></CRUDop>
      {/* Add more content specific to Admin Dashboard */}
	  <LogoutButton></LogoutButton>
    </div>
  );
};

export default AdminDashboard;
