import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProjects } from '../api/projectApi';
import { getTasks } from '../api/taskApi';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          getProjects(),
          getTasks(),
        ]);
        setProjects(projRes.data);
        setTasks(taskRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'active').length,
    totalTasks: tasks.length,
    doneTasks: tasks.filter((t) => t.status === 'done').length,
    inProgressTasks: tasks.filter((t) => t.status === 'in-progress').length,
    todoTasks: tasks.filter((t) => t.status === 'todo').length,
  };

  if (loading) return <><Navbar /><Spinner /></>;

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="page-header">
          <h1>Welcome back, {user?.name} &#128075;</h1>
          <p>Here&apos;s a snapshot of your workspace</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <span className="stat-num">{stats.totalProjects}</span>
            <span className="stat-label">Total Projects</span>
          </div>
          <div className="stat-card stat-green">
            <span className="stat-num">{stats.activeProjects}</span>
            <span className="stat-label">Active Projects</span>
          </div>
          <div className="stat-card stat-yellow">
            <span className="stat-num">{stats.inProgressTasks}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card stat-purple">
            <span className="stat-num">{stats.doneTasks}</span>
            <span className="stat-label">Tasks Done</span>
          </div>
        </div>

        {/* Recent Projects */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Projects</h2>
            <Link to="/projects" className="btn-secondary btn-sm">View All</Link>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>No projects yet.</p>
              <Link to="/projects" className="btn-primary">Create your first project</Link>
            </div>
          ) : (
            <div className="cards-row">
              {projects.slice(0, 3).map((p) => (
                <Link to={`/projects/${p._id}`} key={p._id} className="card mini-card">
                  <strong>{p.name}</strong>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent Tasks */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>My Recent Tasks</h2>
          </div>
          {tasks.length === 0 ? (
            <p className="muted">No tasks assigned yet.</p>
          ) : (
            <table className="task-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {tasks.slice(0, 6).map((t) => (
                  <tr key={t._id}>
                    <td>{t.title}</td>
                    <td>{t.project?.name || '—'}</td>
                    <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                    <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </>
  );
}
