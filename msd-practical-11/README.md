# Practical 11: MERN Stack Blog Management System

A complete, full-stack **Blog Management System** built using the **MERN Stack** (**M**ongoDB Atlas, **E**xpress.js, **R**eact with Vite, and **N**ode.js) featuring secure password hashing with **bcrypt**, **JWT Authentication**, and **Role-Based Access Control (RBAC)** (`user` and `admin` roles).

---

## ✨ Features

1. **Separated Architecture**:
   - `client/`: Modern React (Vite) frontend with React Router v6 and Axios.
   - `server/`: Express.js & Mongoose REST API backend.
2. **Authentication & Security**:
   - User registration, login, and logout flows.
   - Passwords hashed securely using `bcryptjs` before saving to MongoDB.
   - JSON Web Token (`jsonwebtoken`) authentication protecting private API routes.
3. **Role-Based Access Control (RBAC)**:
   - Supports `user` and `admin` roles.
   - **Authenticated `user`**: Can create new blog posts and edit or delete **only their own** blog posts.
   - **Authenticated `admin`**: Can create blog posts and edit or delete **any user's** blog posts across the platform.
4. **Full Blog Post CRUD Operations**:
   - **Create**: Authenticated users can publish blog posts with title, category, and content.
   - **Read / View**: Public blog listing with keyword search, category filtering, and dedicated post detail pages showing author info and timestamps.
   - **Update**: Authors (or admins) can edit post title, category, and content.
   - **Delete**: Authors (or admins) can permanently delete posts.
5. **Responsive UI & Feedback**:
   - Clean, responsive interface with Login, Registration, Blog Listing, Post Details, and Author/Admin Dashboard pages.
   - Client-side and server-side input validation with clear loading spinners, success banners, and error alerts.
6. **Secure Configuration**:
   - All MongoDB Atlas credentials and JWT secrets are loaded strictly via `.env` environment variables (never hardcoded or committed).

---

## 📁 Project Structure

```text
msd-practical-11/
├── client/                     # React (Vite) Frontend
│   ├── src/
│   │   ├── components/         # Navbar, PostCard, ProtectedRoute, AlertMessage
│   │   ├── context/            # AuthContext (JWT & User session state)
│   │   ├── pages/              # HomePage, PostDetailsPage, LoginPage, RegisterPage, DashboardPage
│   │   ├── services/           # Axios API instance with Bearer token interceptor
│   │   ├── App.jsx             # Application routing & layout
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Responsive stylesheet
│   ├── .env.example            # Frontend environment variable template
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express.js & MongoDB Backend
│   ├── config/
│   │   └── db.js               # MongoDB Atlas connection helper
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, GetMe, Logout controllers
│   │   └── postController.js   # Blog CRUD controllers with ownership/admin checks
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification & RBAC middleware
│   ├── models/
│   │   ├── User.js             # User schema (name, email, password, role) + bcrypt hook
│   │   └── Post.js             # Blog Post schema (title, content, category, author, timestamps)
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth routes
│   │   └── postRoutes.js       # /api/posts routes
│   ├── .env.example            # Backend environment variable template
│   ├── .gitignore
│   ├── package.json
│   └── server.js               # Express app entry point & CORS configuration
├── .gitignore
├── package.json                # Root helper scripts
└── README.md
```

---

## 🛠️ Prerequisites

- **Node.js** (v18+ recommended) and **npm** installed on your machine.
- A free **MongoDB Atlas** account ([https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)).

---

## ☁️ Setting Up MongoDB Atlas (Beginner Guide)

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free shared cluster (`M0`).
2. Under **Database Access**, create a database user with a username and password (enable **Read and write to any database**).
3. Under **Network Access**, click **Add IP Address** and add your current IP address (or `0.0.0.0/0` for development access).
4. Go to **Database** → click **Connect** → select **Drivers** (Node.js) and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@<cluster-url>/mern_blog_db?retryWrites=true&w=majority
   ```

---

## ⚙️ Installation & Environment Setup

### Step 1: Install Backend Dependencies

Open a terminal in the project root directory and run:

```bash
cd server
npm install
```

### Step 2: Configure Backend Environment Variables

Copy `server/.env.example` to `server/.env`:

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS / Linux / Git Bash:
cp .env.example .env
```

Open `server/.env` and fill in your MongoDB Atlas URI and JWT secret:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/mern_blog_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Step 3: Install Frontend Dependencies

Open a second terminal in the project root directory and run:

```bash
cd client
npm install
```

### Step 4: Configure Frontend Environment Variables

Copy `client/.env.example` to `client/.env`:

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS / Linux / Git Bash:
cp .env.example .env
```

Verify `client/.env` contains:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Running the Application (Client & Server Separately)

### 1. Start the Backend Server

In Terminal 1 (`server/` folder):

```bash
cd server
npm run dev
```

*(Or from the root directory: `npm run server`)*

The Express API server will start on **`http://localhost:5000`**.

### 2. Start the React Frontend

In Terminal 2 (`client/` folder):

```bash
cd client
npm run dev
```

*(Or from the root directory: `npm run client`)*

The React (Vite) app will start on **`http://localhost:5173`**. Open this URL in your browser.

---

## 🔌 REST API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive a signed JWT token |
| `GET` | `/api/auth/me` | Private | Get currently logged-in user's profile |
| `POST` | `/api/auth/logout` | Private | Log out the current user |

### Blog Posts (`/api/posts`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Public | Get all blog posts (supports `?search=` and `?category=`) |
| `GET` | `/api/posts/:id` | Public | Get a single blog post by ID |
| `POST` | `/api/posts` | Private | Create a new blog post (`title`, `content`, `category`) |
| `PUT` | `/api/posts/:id` | Private | Update a blog post (Author of post **or** `admin` only) |
| `DELETE` | `/api/posts/:id` | Private | Delete a blog post (Author of post **or** `admin` only) |

---

## 🧪 How to Test the Project End-to-End

1. **Register a Regular User (`user` role)**:
   - Navigate to `http://localhost:5173/register`.
   - Enter Name (`Alice Reader`), Email (`alice@example.com`), Password (`password123`), and select Role **`User`**.
   - Click **Register Account**. You will be logged in and redirected to `/dashboard`.
2. **Create & Edit a Blog Post**:
   - On the Dashboard, click **+ Create New Post**.
   - Enter a Title, select a Category (e.g., `MERN Stack`), write content, and click **Publish Blog Post**.
   - Verify the post appears on your Dashboard and on the public **All Posts** page (`/`).
   - Click **Edit** on your post, modify the title or content, and save.
3. **Verify Ownership Protection**:
   - Click **Logout** in the top navigation bar.
   - Register a second user (`Bob Writer`, `bob@example.com`, Role: **`User`**).
   - Go to **All Posts** (`/`) and view Alice's post. Notice that Bob **cannot** see Edit or Delete buttons on Alice's post (and any direct API `PUT`/`DELETE` request returns `403 Forbidden`).
   - Have Bob create his own post — Bob can edit/delete his own post.
4. **Test Admin Role-Based Access Control (`admin` role)**:
   - Click **Logout**, then go to `/register`.
   - Register an Admin user (`Site Admin`, `admin@example.com`, Role: **`Admin`**).
   - Visit the **Dashboard** (`/dashboard`) or **All Posts** (`/`).
   - Notice the **`ADMIN`** badge in the navbar and the **All Platform Posts** tab on the dashboard.
   - The Admin user can **Edit** or **Delete** both Alice's and Bob's posts!
