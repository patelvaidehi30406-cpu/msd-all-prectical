import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

// Connect to the Node.js + Express Socket.IO server
const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3001';

const socket = io(SOCKET_SERVER_URL, {
  autoConnect: true,
  reconnection: true,
});

// Fallback auto-reply generator if testing in a single tab or when server is offline
function generateBotReply(userText, name) {
  const lower = userText.toLowerCase().trim();
  if (lower === 'hi' || lower === 'hy' || lower === 'hello' || lower === 'hey') {
    return `Hello ${name}! 👋 How are you doing today?`;
  }
  if (
    lower.includes('how are you') ||
    lower.includes('kese ho') ||
    lower.includes('kaise ho')
  ) {
    return `I'm doing great, ${name}! Real-time chat is working smoothly.`;
  }
  if (lower.includes('name') || lower.includes('who are you')) {
    return `I am the Practical 12 Chat Assistant! Open http://localhost:5173 in a second tab to chat between two users.`;
  }
  if (lower.includes('bye')) {
    return `Goodbye ${name}! Have a great day! 👋`;
  }
  return `Message received: "${userText}"! 👍`;
}

function App() {
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const messagesEndRef = useRef(null);
  const joinedUserRef = useRef('');

  // Listen for Socket.IO events from the server
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      if (joinedUserRef.current) {
        socket.emit('join_chat', joinedUserRef.current);
      }
    };

    const handleDisconnect = () => setIsConnected(false);

    const handleReceiveMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const handleUserCount = (data) => {
      setUserCount(data.count || 1);
      setOnlineUsers(data.users || []);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_count', handleUserCount);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_count', handleUserCount);
    };
  }, []);

  // Automatically scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle user joining the chat with a username
  const handleJoinChat = (e) => {
    e.preventDefault();
    const trimmedName = username.trim();
    if (!trimmedName) return;

    setUsername(trimmedName);
    joinedUserRef.current = trimmedName;
    setHasJoined(true);

    if (socket.connected) {
      socket.emit('join_chat', trimmedName);
    } else {
      const now = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setMessages([
        {
          id: `${Date.now()}-join`,
          type: 'system',
          username: 'System',
          text: `${trimmedName} joined the chat`,
          timestamp: now,
        },
      ]);
    }
  };

  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmedMessage = currentMessage.trim();
    if (!trimmedMessage) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const messageData = {
      username,
      text: trimmedMessage,
      timestamp,
    };

    if (socket.connected) {
      socket.emit('send_message', messageData);
    } else {
      // Fallback so messages still send and get a reply even if backend server is not running
      const ownMsg = {
        id: `${Date.now()}-own`,
        type: 'chat',
        username,
        senderId: socket.id || 'local-user',
        text: trimmedMessage,
        timestamp,
      };
      setMessages((prev) => [...prev, ownMsg]);

      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-bot`,
            type: 'chat',
            username: 'ChatBot 🤖',
            senderId: 'chatbot-local',
            text: generateBotReply(trimmedMessage, username),
            timestamp: replyTime,
          },
        ]);
      }, 600);
    }

    setCurrentMessage('');
  };

  return (
    <div className="app-container">
      {!hasJoined ? (
        /* Join Screen */
        <div className="join-card">
          <div className="join-badge">Practical 12</div>
          <h1>Real-Time Chat</h1>
          <p className="join-subtitle">
            Enter a username below to join the live chat room.
          </p>

          <form onSubmit={handleJoinChat} className="join-form">
            <label htmlFor="username-input" className="sr-only">
              Username
            </label>
            <input
              id="username-input"
              type="text"
              placeholder="Enter your username (e.g., Alex)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={25}
              required
              autoFocus
            />
            <button type="submit" className="primary-btn">
              Join Chat Room
            </button>
          </form>

          <div className="connection-footer">
            <span
              className={`status-dot ${isConnected ? 'online' : 'offline'}`}
            ></span>
            <span>
              {isConnected
                ? `Server Connected • ${userCount} user${userCount === 1 ? '' : 's'} online`
                : 'Connecting to server...'}
            </span>
          </div>
        </div>
      ) : (
        /* Main Chat Interface */
        <div className="chat-layout">
          {/* Header with connected-users count */}
          <header className="chat-header">
            <div className="header-left">
              <h2>Live Chat Room</h2>
              <span className="current-user-tag">
                Logged in as <strong>{username}</strong>
              </span>
            </div>

            <div className="header-right">
              <div className="users-count-pill" title={onlineUsers.join(', ')}>
                <span className="status-dot online"></span>
                <span>
                  {userCount} {userCount === 1 ? 'User' : 'Users'} Online
                </span>
              </div>
            </div>
          </header>

          {/* Messages Display Area */}
          <main className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <p>No messages yet. Say hello to start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="system-message">
                      <span>
                        {msg.text} • {msg.timestamp}
                      </span>
                    </div>
                  );
                }

                const isOwnMessage =
                  msg.senderId === 'local-user' ||
                  (msg.senderId && socket.id
                    ? msg.senderId === socket.id
                    : msg.username === username);

                return (
                  <div
                    key={msg.id}
                    className={`message-wrapper ${
                      isOwnMessage ? 'own-message' : 'other-message'
                    }`}
                  >
                    <div className="message-bubble">
                      <div className="message-meta">
                        <span className="message-author">
                          {isOwnMessage ? 'You' : msg.username}
                        </span>
                        <span className="message-time">{msg.timestamp}</span>
                      </div>
                      <p className="message-text">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </main>

          {/* Message Input Bar */}
          <form onSubmit={handleSendMessage} className="message-input-form">
            <input
              type="text"
              placeholder="Type a message and press Enter..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="send-btn"
              disabled={!currentMessage.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
