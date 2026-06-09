# 📝 Post Management App (Full Stack Coding Challenge)

A minimal, full-stack Post Management App built for the **MyPustak Full Stack Developer Coding Challenge**. 

This application consists of a **FastAPI** backend that manages posts in-memory and a responsive, interactive **Next.js (React)** frontend styled with **Tailwind CSS v4** and **TypeScript**.

---

## 📂 Project Structure

```
my-app/
├── backend/
│   ├── main.py              # FastAPI application server with CRUD endpoints
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main post manager dashboard UI
│   │   ├── layout.tsx       # Root layout configuration with Geist fonts
│   │   └── globals.css      # Tailwind v4 globals configuration
│   ├── package.json         # Frontend project manifest and dependencies
│   └── ...                  # Next.js configurations
└── README.md                # Setup and documentation (this file)
```

---

## 🔧 Prerequisites

Make sure you have the following installed on your machine:
- **Python** (version 3.9 or higher)
- **Node.js** (version 18 or higher)
- **NPM** (version 9 or higher)

---

## 🚀 Getting Started

To run the application locally, you will need to start both the backend and frontend servers.

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. (Optional but recommended) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (cmd/powershell):
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The API will start and be available at **`http://127.0.0.1:8000`**. You can view the auto-generated interactive documentation at **`http://127.0.0.1:8000/docs`**.

---

### 2. Frontend Setup (Next.js)

1. Open a new terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install the node dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will start and be accessible at **`http://localhost:3000`**.

---

## 🎨 Application Features & UX Details

- **Create Post**: A clean card-form with client-side text input validation. Submitting a post calls `POST /posts` and inserts the new post dynamically without requiring a page refresh.
- **Display Posts**: Fetches and lists all current posts on load. Supports loading skeletons and elegant error recovery states.
- **Delete Post**: Clicking the trash icon calls `DELETE /posts/{id}` and updates the client list instantly.
- **Search & Filter (Bonus)**: Real-time search query matching across both titles and body text.
- **Micro-Animations**: Hover animations on form components, list cards, and buttons for a smooth, modern UI flow.
- **Dark/Light Mode**: The app utilizes CSS theme media triggers to adapt beautifully to your system's light or dark mode preference.

---

## 📡 API Endpoints Reference

The backend exposes the following REST API endpoints:

| Method | Endpoint | Description | Status Code | Example Request Body / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/posts` | Returns list of all posts. | `200 OK` | N/A |
| **POST** | `/posts` | Creates a new post. | `201 Created` | `{"title": "New Post", "body": "Post content goes here"}` |
| **DELETE**| `/posts/{id}` | Deletes post by integer ID. | `204 No Content`| Returns `404 Not Found` if the post ID doesn't exist. |
