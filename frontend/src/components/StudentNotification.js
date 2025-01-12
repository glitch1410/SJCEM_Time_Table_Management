import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/MessagingDashboard.css'

const StudentNotification = ({ fetchNotificationCount }) => { // Accept fetch function as prop
  const [messages, setMessages] = useState([]);

  // Fetch messages from the database
  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/messages');
      setMessages(response.data);
      fetchNotificationCount(); // Call to update notification count
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const formatMessage = (text) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g; 
    // Regular expression to match bold text (e.g., **text**)
    const boldRegex = /\*\*(.*?)\*\*/g; 

    // Split the text by newlines to maintain paragraph breaks
    const paragraphs = text.split(/\n/g);

    return paragraphs.map((paragraph, paragraphIndex) => {
      // Split each paragraph by URLs to format accordingly
      const parts = paragraph.split(urlRegex).flatMap((part, partIndex) => {
        // Check if this part is a URL
        if (urlRegex.test(part)) {
          return (
            <a key={partIndex} href={part} target="_blank" rel="noopener noreferrer">
              {part}
            </a>
          );
        }
        // Replace bold text patterns with <strong> tags
        const formattedText = part.replace(boldRegex, '<strong>$1</strong>');
        return [
          <span key={partIndex} dangerouslySetInnerHTML={{ __html: formattedText }} />,
          // Add a <br /> tag after each part except the last one in the paragraph
          partIndex < paragraph.split(urlRegex).length - 1 ? <br key={`br-${partIndex}`} /> : null
        ];
      });

      // Return the complete paragraph with a <br /> tag at the end
      return (
        <div key={paragraphIndex}>
          {parts}
          {/* Add a break after the paragraph */}
        </div>
      );
    });
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className='messaging-dashboard'>
      <div className="message-box">
        <h2>
          Messages
          <button onClick={fetchMessages} style={{ marginLeft: '10px' }}>Refresh</button>
        </h2>
        <ul>
          {messages.map((msg) => (
            <li key={msg.message_id}>
              <div className="message-header">
                <strong>{msg.sender}</strong>
                <span>{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              <div className="message-content">
                {formatMessage(msg.content)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentNotification;
