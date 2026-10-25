const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const { execSync } = require('child_process');

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Configure CORS for Express HTTP requests
app.use(
  cors({
    origin: [CLIENT_URL, 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

app.use(express.json());

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Practical 12 Socket.IO Chat Server is active.',
  });
});

// Create HTTP server and attach Socket.IO with CORS configuration
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store active users mapped by socket.id -> username
const activeUsers = new Map();

// Helper function to format current time nicely (e.g., "02:55 PM")
function getFormattedTime() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Broadcast current online user count and user list to everyone
function broadcastUserCount() {
  io.emit('user_count', {
    count: activeUsers.size,
    users: Array.from(activeUsers.values()),
  });
}

// Generate a friendly reply when a user is testing alone in a single tab
function getAutoBotReply(userText, username) {
  const lower = userText.toLowerCase().trim();
  if (lower === 'hi' || lower === 'hy' || lower === 'hello' || lower === 'hey') {
    return `Hello ${username}! 👋 How can I help you today? (Tip: Open http://localhost:5173 in a 2nd tab to chat between two live users!)`;
  }
  if (lower.includes('how are you') || lower.includes('kese ho') || lower.includes('kaise ho')) {
    return `I'm doing great, ${username}! Socket.IO real-time messaging is working smoothly.`;
  }
  if (lower.includes('name') || lower.includes('who are you')) {
    return `I am the Practical 12 Demo Bot! Join from another browser tab to test multi-user chat.`;
  }
  if (lower.includes('bye')) {
    return `Goodbye ${username}! Have a great day! 👋`;
  }
  return `Got your message: "${userText}"! (Open http://localhost:5173 in another tab to reply as a second user.)`;
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Send the current user count as soon as a client connects
  broadcastUserCount();

  // When a user enters a username and joins the chat
  socket.on('join_chat', (username) => {
    const cleanName = String(username || '').trim();
    if (!cleanName) return;

    activeUsers.set(socket.id, cleanName);
    console.log(`${cleanName} joined the chat (${socket.id})`);

    // Update everyone's connected users count
    broadcastUserCount();

    // Notify everyone in the chat that a user joined
    io.emit('receive_message', {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'system',
      username: 'System',
      text: `${cleanName} joined the chat`,
      timestamp: getFormattedTime(),
    });
  });

  // When a user sends a chat message
  socket.on('send_message', (messageData) => {
    const username = activeUsers.get(socket.id) || messageData.username || 'Anonymous';
    const text = String(messageData.text || '').trim();

    if (!text) return;

    const newMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'chat',
      username,
      senderId: socket.id,
      text,
      timestamp: messageData.timestamp || getFormattedTime(),
    };

    // Broadcast message instantly to all connected clients
    io.emit('receive_message', newMessage);

    // If only 1 user is online, send an automatic reply so single-tab testing shows incoming messages too
    if (activeUsers.size <= 1) {
      setTimeout(() => {
        io.emit('receive_message', {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: 'chat',
          username: 'ChatBot 🤖',
          senderId: 'chatbot-server',
          text: getAutoBotReply(text, username),
          timestamp: getFormattedTime(),
        });
      }, 700);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const username = activeUsers.get(socket.id);

    if (username) {
      activeUsers.delete(socket.id);
      console.log(`${username} left the chat (${socket.id})`);

      // Update connected users count
      broadcastUserCount();

      // Notify remaining users that this user left
      io.emit('receive_message', {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: 'system',
        username: 'System',
        text: `${username} left the chat`,
        timestamp: getFormattedTime(),
      });
    } else {
      console.log(`Socket disconnected: ${socket.id}`);
    }
  });
});

let retriedPortCleanup = false;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && !retriedPortCleanup) {
    retriedPortCleanup = true;
    console.log(`Port ${PORT} is busy. Stopping previous server process...`);
    try {
      // Find and stop the previous process holding this port on Windows
      const output = execSync(`netstat -ano | findstr :${PORT}`).toString();
      const lines = output.trim().split('\n');
      const pids = new Set();

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && Number(pid) !== process.pid) {
          pids.add(pid);
        }
      }

      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
        } catch (_) {
          // Ignore if already stopped
        }
      }

      setTimeout(() => {
        server.listen(PORT);
      }, 500);
      return;
    } catch (_) {
      console.error(
        `Port ${PORT} is already in use. Run "taskkill /F /IM node.exe" in terminal and try again.`
      );
      process.exit(1);
    }
  } else if (err.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Run "taskkill /F /IM node.exe" in terminal and try again.`
    );
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
