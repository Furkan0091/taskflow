# TaskFlow

A full-stack task management app built with React and Node.js. Organize work on a Kanban board with powerful productivity features.

## Features

- **JWT Authentication** — Secure register/login
- **Kanban Board** — To Do / In Progress / Done columns
- **Subtasks** — Break tasks into smaller steps with a progress bar per task
- **Tags / Labels** — Add custom tags to tasks, filter board by tag
- **Search** — Full-text search across task titles and descriptions
- **Priority Levels** — High / Medium / Low with color badges
- **Due Dates** — Deadlines with overdue warnings
- **Overall Progress Bar** — Visual % of tasks completed
- **Quick Status Move** — Move tasks between columns in one click
- **Responsive** — Works on mobile and desktop

## Tech Stack

**Frontend:** React 18, React Router v6, Axios, Context API

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

## Getting Started

### Prerequisites
- Node.js v16+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)

### 1. Clone the repo
```bash
git clone https://github.com/Furkan0091/taskflow.git
cd taskflow
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env .env
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm start
```

App runs at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Current user | Yes |
| GET | `/api/tasks` | Get tasks (supports `?search=`, `?priority=`, `?tag=`) | Yes |
| POST | `/api/tasks` | Create task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |
| PATCH | `/api/tasks/:id/status` | Update status | Yes |
| PATCH | `/api/tasks/:id/subtasks/:sid` | Toggle subtask | Yes |
| GET | `/api/tasks/meta/tags` | Get all user tags | Yes |

## Project Structure

```
taskflow/
├── backend/
│   ├── middleware/auth.js       # JWT protection
│   ├── models/
│   │   ├── User.js              # User schema + password hashing
│   │   └── Task.js              # Task schema with subtasks & tags
│   ├── routes/
│   │   ├── auth.js              # Register / Login / Me
│   │   └── tasks.js             # Full CRUD + search + subtasks
│   └── server.js
└── frontend/src/
    ├── components/
    │   ├── TaskCard.js          # Card with subtask bar + tags
    │   └── TaskModal.js         # Create/edit with tags & subtasks
    ├── context/AuthContext.js   # Global auth state
    ├── pages/
    │   ├── Login.js
    │   ├── Register.js
    │   └── Dashboard.js         # Kanban + search + filters
    └── App.js
```

## License
MIT
