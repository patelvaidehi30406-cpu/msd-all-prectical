# Practical 12: Real-Time Chat Application

A clean, beginner-friendly real-time chat application built with **React (Vite)**, **Node.js**, **Express.js**, and **Socket.IO**.

---

## Features

- **Real-Time Messaging**: Instant bi-directional message broadcasting powered by Socket.IO.
- **Username Join Flow**: Users enter a display username before joining the live chat room.
- **Message Metadata**: Every message displays the sender's username and formatted timestamp.
- **Live Connected-Users Counter**: Displays the real-time count of active users in the room.
- **System Notifications**: Broadcasts join and leave announcements when users connect or disconnect.
- **Responsive UI**: Works smoothly across desktop and mobile screen sizes.
- **Configured CORS**: Pre-configured CORS policy between the Vite frontend (`http://localhost:5173`) and Express/Socket.IO backend (`http://localhost:3001`).

---

## Project Structure

```text
msd-practical-12/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── App.css         # Responsive styling for join screen & chat interface
│   │   ├── App.jsx         # Socket.IO client logic & chat UI component
│   │   ├── index.css       # Global CSS reset & layout styles
│   │   └── main.jsx        # React DOM entry point
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js + Express + Socket.IO backend
│   ├── .gitignore
│   ├── index.js            # Express server, CORS config & Socket.IO event handlers
│   └── package.json
├── .gitignore
├── package.json            # Root scripts for convenience
└── README.md
```

---

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes bundled with Node.js)

---

## Installation Instructions

### Option 1: Install from the Root Folder
Run the helper script from the project root directory (`msd-practical-12`):

```bash
npm run install:all
```

### Option 2: Install Manually in Each Folder

1. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

---

## Running the Application Locally

You will need **two terminal windows** open simultaneously (one for the backend server and one for the frontend client).

### Step 1: Start the Backend Server
In your first terminal, from the root directory:
```bash
npm run start:server
```
*(Or navigate to `cd server` and run `npm start` or `npm run dev`)*

The server will start on **`http://localhost:3001`**.

### Step 2: Start the React Frontend
In your second terminal, from the root directory:
```bash
npm run dev:client
```
*(Or navigate to `cd client` and run `npm run dev`)*

The Vite client will start on **`http://localhost:5173`**.

### Step 3: Test Real-Time Chat
1. Open **`http://localhost:5173`** in two separate browser tabs (or windows).
2. Enter a username in each tab and click **Join Chat Room**.
3. Send messages between the tabs and watch the messages and connected-users count update in real time!
