# TeamFlow — Team Project Management System

A production-style full-stack MERN application with DevOps practices including Docker, Kubernetes, and GitHub Actions CI/CD.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Containerization | Docker |
| Orchestration | Kubernetes (Minikube) |
| CI/CD | GitHub Actions |
| Deployment | Render (backend) + Vercel (frontend) |

---

## Features

- **Auth** — Register / Login with JWT authentication
- **Projects** — Create, view, update, delete projects
- **Tasks** — Create, update, delete tasks with priority and due dates
- **Kanban Board** — Visual task board with To Do / In Progress / Review / Done columns
- **Dashboard** — Stats overview + recent projects and tasks
- **Role-based access** — Admin and Member roles

---

## Project Structure

```
capstone/
├── backend/                  # Express API
│   ├── src/
│   │   ├── config/db.js      # MongoDB connection
│   │   ├── middleware/       # auth.js, errorHandler.js
│   │   ├── models/           # User, Project, Task schemas
│   │   ├── routes/           # authRoutes, projectRoutes, taskRoutes, userRoutes
│   │   └── tests/            # Jest + Supertest
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── frontend/                 # React app
│   ├── src/
│   │   ├── api/              # axios instance + API calls
│   │   ├── components/       # Navbar, TaskCard, ProjectCard, etc.
│   │   ├── context/          # AuthContext
│   │   └── pages/            # Login, Register, Dashboard, Projects, ProjectDetail
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── k8s/                      # Kubernetes manifests
│   ├── namespace.yaml
│   ├── backend-secret.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── ingress.yaml
├── .github/workflows/
│   └── ci-cd.yml             # GitHub Actions pipeline
└── docker-compose.yml
```

---

## Getting Started Locally

### 1. Clone and setup environment

```bash
# Backend
cd backend
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm install
npm run dev     # runs on http://localhost:5000

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev     # runs on http://localhost:5173
```

---

## Docker (Local)

```bash
# From capstone/ root — create a .env file with MONGO_URI and JWT_SECRET
cp backend/.env.example .env

docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

---

## Kubernetes (Minikube)

```bash
# Start Minikube
minikube start

# Build images locally into Minikube
eval $(minikube docker-env)
docker build -t teamflow-backend:latest ./backend
docker build -t teamflow-frontend:latest ./frontend

# Edit k8s/backend-secret.yaml with your real MONGO_URI and JWT_SECRET

# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/backend-secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Check pods
kubectl get pods -n teamflow

# Access frontend
minikube service frontend-service -n teamflow
```

---

## CI/CD — GitHub Actions

The pipeline (`.github/workflows/ci-cd.yml`) has 5 jobs:

| Job | Trigger | What it does |
|---|---|---|
| `backend-ci` | Every push/PR | Install deps, run Jest tests |
| `frontend-ci` | Every push/PR | Install deps, lint, build |
| `docker-build` | Push to `main` | Build & push images to Docker Hub |
| `deploy-backend` | Push to `main` | Trigger Render deploy hook |
| `deploy-frontend` | Push to `main` | Deploy to Vercel via CLI |

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `MONGO_URI_TEST` | MongoDB URI for test environment |
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `RENDER_DEPLOY_HOOK_BACKEND` | Render webhook URL for backend |
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel org/team ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | Get all user projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project by ID |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks?project=<id>` | Get tasks (filter by project) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task by ID |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users (admin only) |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update own profile |

---

## Deployment

### Backend → Render (free tier)
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root to `backend/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `NODE_ENV=production`

### Frontend → Vercel (free tier)
1. Import your GitHub repo on [vercel.com](https://vercel.com)
2. Set root to `frontend/`
3. Build command: `npm run build`, output: `dist`
4. Add environment variable: `VITE_API_URL=https://<your-render-app>.onrender.com/api`
