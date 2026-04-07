# Full Stack Online Quiz App 🚀

Welcome to your new React + FastAPI + Supabase full-stack web application! 

This repository contains the complete codebase designed with modern practices, a responsive tailwind UI, and backend grading.

## Directory Structure
```
quiz/
├── setup.sql              # Supabase Database Schema & Sample Data
├── backend/               # FastAPI Python Server
│   ├── .env               # Secrets for Backend
│   ├── requirements.txt   # Python Dependencies
│   ├── main.py            # API Routes
│   ├── models.py          # Pydantic Schemas
│   └── database.py        # Supabase Client Setup
└── frontend/              # React Vite App
    ├── .env               # Secrets for Frontend
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── supabaseClient.js
        ├── components/
        │   └── Navbar.jsx
        ├── context/
        │   └── AuthContext.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Quiz.jsx
            └── Result.jsx
```

## Step 1: Database Setup (Supabase)
1. Log in to your [Supabase Dashboard](https://supabase.com).
2. Go to your project: `sgesvedphatskiwerhqv`
3. Navigate to **SQL Editor** on the left menu.
4. Copy the entire contents of `setup.sql` located in the root of this project and run it. This creates the required `quizzes`, `questions`, `options`, and `results` tables plus some realistic sample data.

---

## Step 2: Configure Environment Variables

1. Go to **Supabase > Settings > API**.
2. **Frontend Settings**:
   Open `frontend/.env` file and replace `your-supabase-anon-key-here` with your **Project API Key (anon/public)**.
   ```env
   VITE_SUPABASE_URL=https://sgesvedphatskiwerhqv.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhb... (your anon key)
   ```

3. **Backend Settings**:
   Open `backend/.env` file and replace `your-supabase-anon-key-here` with your **Project API Key (anon/public or service_role)**.
   ```env
   SUPABASE_URL=https://sgesvedphatskiwerhqv.supabase.co
   SUPABASE_KEY=eyJhb... (your key)
   ```

---

## Step 3: Run the Backend (FastAPI)

Open a new terminal and run:
```bash
cd backend

# (Optional but recommended) Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\activate   # On Windows

# Install Dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```
The backend will run on **http://localhost:8000**.

---

## Step 4: Run the Frontend (React + Vite)

Open another terminal and run:
```bash
cd frontend

# Install Dependencies (if not already done)
npm install

# Start the development server
npm run dev
```
The React frontend will typically run on **http://localhost:5173**. 

You're all set! Open your browser and test out logging in, picking a quiz, and completing it!
