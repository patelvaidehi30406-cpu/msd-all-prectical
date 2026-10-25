# Practical 13: Full-Stack MERN Document Management System (DocVault)

A beginner-friendly, full-stack **MERN** (**M**ongoDB Atlas, **E**xpress.js, **R**eact with Vite, **N**ode.js) Document Management System. Authenticated users can securely upload, list, search, download, and delete their own private documents.

---

## Features

1. **User Authentication & Security**
   - User registration and login with `bcryptjs` password hashing.
   - Stateless authentication using signed JSON Web Tokens (`JWT`).
   - Protected Express routes that verify user identity on every document request.
2. **Document Upload & Validation (`Multer`)**
   - Drag-and-drop or click-to-browse file upload with live progress bar.
   - Server-side and client-side validation for allowed file types (`PDF`, `DOC`, `DOCX`, `XLS`, `XLSX`, `PPT`, `PPTX`, `TXT`, `CSV`, `JPG`, `JPEG`, `PNG`, `WEBP`) and maximum file size (`10 MB` default).
   - Graceful Multer error handling with clear JSON error responses.
3. **MongoDB Atlas Metadata & Ownership Isolation**
   - Stores `filename`, `originalName`, `fileType`, `fileSize`, `uploadDate`, and `owner` (`ObjectId` ref to `User`) in MongoDB.
   - Strict ownership checks ensure users can **only** view, download, or delete their own documents.
   - Deleting a document removes both the MongoDB metadata record and the physical file on disk.
4. **Responsive Dashboard UI**
   - Built with React 18 and Vite.
   - Displays storage metrics, upload dropzone, search bar, file type badges, formatted file sizes/dates, and Download/Delete controls.

---

## Project Structure

```text
msd-practical-13/
├── client/                         # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthForm.jsx        # Login & Register tabbed form
│   │   │   ├── DocumentList.jsx    # Document table with search, download & delete
│   │   │   ├── Navbar.jsx          # Top navigation bar with user profile & logout
│   │   │   └── UploadBox.jsx       # Drag-and-drop uploader with validation
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # React context for auth state & JWT session
│   │   ├── services/
│   │   │   └── api.js              # Axios client configured with VITE_API_URL
│   │   ├── App.jsx                 # Main application shell & dashboard view
│   │   ├── index.css               # Responsive stylesheet
│   │   └── main.jsx                # React DOM entry point
│   ├── .env.example                # Frontend environment variables template
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                         # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                   # Mongoose connection to MongoDB Atlas
│   ├── controllers/
│   │   ├── authController.js       # Register, login, and current user handlers
│   │   └── documentController.js   # Upload, list, download, and delete handlers
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification middleware
│   │   └── uploadMiddleware.js     # Multer storage, file filter, size limit & error handler
│   ├── models/
│   │   ├── Document.js             # Document metadata schema
│   │   └── User.js                 # User schema with bcrypt password hashing
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth routes
│   │   └── documentRoutes.js       # /api/documents routes
│   ├── uploads/
│   │   └── .gitkeep                # Keeps folder in git while ignoring private uploads
│   ├── .env.example                # Backend environment variables template
│   ├── .gitignore
│   ├── package.json
│   └── server.js                   # Express app entry point
├── .env.example                    # Combined reference of environment variables
├── .gitignore                      # Root gitignore (excludes node_modules, .env, uploads)
├── package.json                    # Convenience root scripts
└── README.md
```

---

## Prerequisites

- **Node.js** (v18+ recommended) and **npm**
- A **MongoDB Atlas** account and cluster URI (or a local MongoDB instance for offline testing)

---

## 1. Installation

Open a terminal in the project root (`msd-practical-13`) and install dependencies for both the backend and frontend:

### Install Backend Dependencies
```bash
cd server
npm install
```

### Install Frontend Dependencies
```bash
cd ../client
npm install
```

*(Alternatively, from the root folder, you can run `npm run install:all`.)*

---

## 2. Environment Setup

### Backend (`server/.env`)

1. Copy `server/.env.example` to `server/.env`:
   ```bash
   # PowerShell
   Copy-Item server/.env.example server/.env
   ```
   *(Or on macOS/Linux: `cp server/.env.example server/.env`)*

2. Open `server/.env` and fill in your MongoDB Atlas connection string and JWT secret:
   ```env
   PORT=5050
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/practical13_dms?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   MAX_FILE_SIZE_MB=10
   ```
   > **MongoDB Atlas Tip:** In your Atlas dashboard, go to **Database Access** to ensure your database user has read/write permissions, and **Network Access** to allow your IP address (or `0.0.0.0/0` for development).

### Frontend (`client/.env`)

1. Copy `client/.env.example` to `client/.env`:
   ```bash
   # PowerShell
   Copy-Item client/.env.example client/.env
   ```
2. Verify `client/.env` points to your backend API URL:
   ```env
   VITE_API_URL=http://localhost:5050/api
   ```

---

## 3. Running the Application (Separate Terminals)

### Terminal 1 — Start the Express Backend
```bash
cd server
npm run dev
```
*(Or run `npm start` for standard Node execution, or `npm run server:dev` from the root directory.)*
- The backend server will start on **`http://localhost:5050`**.

### Terminal 2 — Start the React (Vite) Frontend
```bash
cd client
npm run dev
```
*(Or run `npm run client` from the root directory.)*
- The Vite dev server will start on **`http://localhost:5173`**.

---

## 4. How to Test Locally (End-to-End Verification)

1. **Health Check:**
   Open `http://localhost:5050/api/health` in your browser or run:
   ```bash
   curl http://localhost:5050/api/health
   ```
   You should receive `{"success":true,"message":"Practical 13 MERN Document Management API is running."}`.

2. **User Registration & Login:**
   - Open `http://localhost:5173` in your browser.
   - Click **Create Account**, enter a name (`Alice`), email (`alice@example.com`), and password (`password123`), then submit.
   - Verify you are automatically logged in and redirected to the Dashboard.

3. **Upload a Valid Document:**
   - Drag and drop a `.pdf`, `.txt`, `.docx`, or `.png` file (under 10 MB) into the **Upload Document** dropzone and click **Upload Document**.
   - Verify the file appears immediately in **My Documents** with its original name, file type badge, file size, and upload timestamp.

4. **Test File Validation:**
   - Try selecting an unsupported file extension (e.g., `.exe` or `.zip`) or a file larger than 10 MB.
   - Verify the app blocks the upload and displays a clear error message.

5. **Download & Delete:**
   - Click **Download** next to your uploaded document and verify the browser downloads the file with its original filename.
   - Click **Delete**, confirm the prompt, and verify the document is removed from both the UI list and `server/uploads/`.

6. **Verify Ownership Isolation:**
   - Click **Sign Out** in the top-right corner.
   - Register a second user (`bob@example.com`).
   - Verify Bob's dashboard shows `0` documents and cannot see, download, or delete Alice's documents.

---

## API Endpoints Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server health check |
| `POST` | `/api/auth/register` | Public | Register a new user & receive JWT |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT |
| `GET` | `/api/auth/me` | Private | Get logged-in user's profile |
| `GET` | `/api/documents` | Private | List all documents owned by current user |
| `POST` | `/api/documents/upload` | Private | Upload a document (`multipart/form-data`, field: `document`) |
| `GET` | `/api/documents/:id/download` | Private | Download a document owned by current user |
| `DELETE` | `/api/documents/:id` | Private | Delete a document owned by current user |
