import React, { useState } from 'react';
import axios from 'axios';
import '../css/MessagingDashboard.css';

const SendMessage = () => {
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');

  const sendMessage = async () => {
    if (!message || !sender) {
      alert('Please fill in both sender and message.');
      return;
    }

    // Confirmation prompt
    const isConfirmed = window.confirm(`Are you sure you want to send this message? \n\nSender: ${sender}\nMessage: ${message}`);
    
    if (!isConfirmed) {
      return; // Exit if the user cancels
    }

    try {
      await axios.post('http://localhost:5000/messages', { sender, content: message });
      setMessage(''); // Clear input after sending
      setSender('');  // Clear sender after sending
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="send-message">
      <h2>Send Message</h2>
      <input
        type="text"
        placeholder="Your Name"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
      />
      <textarea
        placeholder="Enter your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></textarea>
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default SendMessage;
