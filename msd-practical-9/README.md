# Practical 9: File Upload Module (Node.js, Express.js, Multer & MongoDB)

A beginner-friendly File Upload REST API built with **Node.js**, **Express.js**, **Multer**, and **MongoDB (Mongoose)**. This module handles single-file uploads, validates allowed file types and file sizes, stores physical files in the `uploads/` directory, and saves file metadata in MongoDB.

---

## Features

- **Express Server**: Modular and clean setup in `server.js`.
- **Disk Storage with Multer**: Saves uploaded files into the `uploads/` folder with unique filenames.
- **File Validation**:
  - **Allowed File Types**: `PDF`, `JPG`, `JPEG`, `PNG`, and `DOCX`.
  - **File Size Limit**: Maximum **5 MB** per file.
- **MongoDB Metadata Storage**: Saves `originalFilename`, `storedFilename`, `filePath`, `mimeType`, `size`, and `uploadDate` using Mongoose.
- **Robust Error Handling**: Gracefully handles missing files, unsupported file formats, oversized files, and database/server errors.
- **Environment Configuration**: Uses `.env` for `PORT` and `MONGODB_URI`.

---

## Project Structure

```text
msd-practical-9/
├── config/
│   └── multerConfig.js    # Multer diskStorage, fileFilter, and size limit configuration
├── models/
│   └── File.js            # Mongoose schema & model for file metadata
├── routes/
│   └── fileRoutes.js      # POST /api/files/upload and GET /api/files endpoints
├── uploads/               # Directory where uploaded files are stored
│   └── .gitkeep
├── .env                   # Environment variables (ignored by Git)
├── .env.example           # Example environment variables template
├── .gitignore             # Git ignore rules
├── package.json           # Project metadata, scripts, and dependencies
├── README.md              # Project documentation & Postman testing guide
└── server.js              # Express app entry point & MongoDB connection
```

---

## Prerequisites

1. **Node.js** (v16 or higher recommended)
2. **MongoDB** (Local MongoDB Community Server running on port `27017` or a MongoDB Atlas cluster URI)
3. **Postman** (for testing the API endpoints)

---

## Setup & Installation

### 1. Install Dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

### 2. Configure Environment Variables

Check the `.env` file in the root directory (or copy `.env.example` to `.env`):

```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/msd_practical_9
```

> **Note:** If you are using **MongoDB Atlas**, replace `MONGODB_URI` with your own connection string placeholder, e.g. `mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/msd_practical_9`. Never commit real credentials to Git.

### 3. Run the Application

- **Development Mode (with auto-restart via Nodemon):**
  ```bash
  npm run dev
  ```

- **Production / Standard Mode:**
  ```bash
  npm start
  ```

Once started, you will see:
```text
Connected to MongoDB successfully.
Server is running on http://localhost:5001
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health-check endpoint showing available routes |
| `POST` | `/api/files/upload` | Upload a single file (`form-data` field: `file`) |
| `GET` | `/api/files` | Retrieve a list of all uploaded files' metadata |
| `GET` | `/uploads/<storedFilename>` | View or download an uploaded file statically |

---

## Testing with Postman

### 1. Upload a File (`POST /api/files/upload`)

1. Open **Postman** and create a new request.
2. Set the HTTP method to **`POST`**.
3. Enter the URL:
   ```text
   http://localhost:5001/api/files/upload
   ```
4. Go to the **Body** tab and select **`form-data`**.
5. In the **Key** column:
   - Type `file`
   - Change the dropdown on the right side of the Key cell from **Text** to **File**.
6. In the **Value** column, click **Select Files** and choose a valid `.pdf`, `.jpg`, `.png`, or `.docx` file (under 5 MB).
7. Click **Send**.

#### Expected Success Response (`201 Created`):
```json
{
  "success": true,
  "message": "File uploaded and metadata saved successfully.",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "originalFilename": "sample-document.pdf",
    "storedFilename": "1717500100000-123456789.pdf",
    "filePath": "uploads/1717500100000-123456789.pdf",
    "mimeType": "application/pdf",
    "size": 104520,
    "uploadDate": "2026-10-24T19:30:00.000Z",
    "createdAt": "2026-10-24T19:30:00.000Z",
    "updatedAt": "2026-10-24T19:30:00.000Z",
    "__v": 0
  }
}
```

---

### 2. List All Uploaded Files (`GET /api/files`)

1. Create a new request in **Postman**.
2. Set the HTTP method to **`GET`**.
3. Enter the URL:
   ```text
   http://localhost:5001/api/files
   ```
4. Click **Send**.

#### Expected Response (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "originalFilename": "sample-document.pdf",
      "storedFilename": "1717500100000-123456789.pdf",
      "filePath": "uploads/1717500100000-123456789.pdf",
      "mimeType": "application/pdf",
      "size": 104520,
      "uploadDate": "2026-10-24T19:30:00.000Z",
      "createdAt": "2026-10-24T19:30:00.000Z",
      "updatedAt": "2026-10-24T19:30:00.000Z",
      "__v": 0
    }
  ]
}
```

---

### 3. Testing Error Scenarios in Postman

- **Missing File (`400 Bad Request`)**:
  Send `POST http://localhost:5001/api/files/upload` without selecting a file.
  ```json
  {
    "success": false,
    "message": "No file provided. Please attach a file under the field name \"file\"."
  }
  ```

- **Unsupported File Type (`400 Bad Request`)**:
  Try uploading a `.txt`, `.exe`, or `.zip` file.
  ```json
  {
    "success": false,
    "message": "Unsupported file type. Only PDF, JPG, JPEG, PNG, and DOCX files are allowed."
  }
  ```

- **File Too Large (`400 Bad Request`)**:
  Try uploading a file larger than 5 MB.
  ```json
  {
    "success": false,
    "message": "File size exceeds the 5 MB limit."
  }
  ```
