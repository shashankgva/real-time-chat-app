import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const App = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('receive_message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Listen for updated user list
    socket.on('update_users', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    // cleanup on component unmount
    return () => {
      socket.off('receive_message');
      socket.off('update_users');
    };
  }, []);

  const joinChat = () => {
    socket.emit('join_chat', username);
    setIsJoined(true);
  };

  const sendMessage = () => {
    const messageData = {
      username,
      message,
      time: new Date().toLocaleDateString(),
    };

    socket.emit('send_message', messageData);
    setMessage('');
  };

  return (
    <div style={{ padding: '20px' }}>
      {!isJoined ? (
        <div>
          <h2>Join Chat</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={joinChat}>Join</button>
        </div>
      ) : (
        <div>
          <h2>Chat Room</h2>
          <div style={{ marginBottom: '20px' }}>
            <h2>Users</h2>
            <ul>
              {users.map((user) => (
                <li key={user.id}>{user.username}</li>
              ))}
            </ul>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <h4>Messages</h4>
            <div
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                maxHeight: '300px',
                overflowY: 'scroll',
              }}
            >
              {messages.map((msg, index) => (
                <p key={index}>
                  <strong>{msg.username}</strong>:{msg.message}
                  <em>{msg.time}</em>
                </p>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}> Send</button>
        </div>
      )}
    </div>
  );
};

export default App;
