import React from 'react';
import SendMessage from './SendMessage';
import MessageBox from './MessageBox';
import '../css/MessagingDashboard.css'

const MessagingDashboard = () => {
  return (
    <div className='messaging-dashboard'>
      <h1>Messaging System</h1>
      <SendMessage />
      <MessageBox />
    </div>
  );
};

export default MessagingDashboard;
