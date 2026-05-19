import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, updateProject, deleteProject } from '../api/projectApi';
import { getTasks, createTask, updateTask, deleteTask } from '../api/taskApi';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

const TASK_INIT = { title: '', description: '', priority: 'medium', dueDate: '' };
const COLUMNS   = ['todo', 'in-progress', 'review', 'done'];
const COL_LABEL = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };

export default function ProjectDetail() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [project, setProject]     = useState(null);
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm]   = useState(TASK_INIT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [editMode, setEditMode]   = useState(false);
  const [editForm, setEditForm]   = useState({ name: '', description: '', status: '' });

  const load = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        getProject(id),
        getTasks(id),
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
      setEditForm({
        name: projRes.data.name,
        description: projRes.data.description,
        status: projRes.data.status,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleTaskChange = (e) =>
    setTaskForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await createTask({ ...taskForm, project: id });
      setTasks((prev) => [res.data, ...prev]);
      setTaskForm(TASK_INIT);
      setShowTaskForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await updateTask(taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProject(id, editForm);
      setProject(res.data);
      setEditMode(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this entire project and all its tasks?')) return;
    try {
      await deleteProject(id);
      navigate('/projects');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading) return <><Navbar /><Spinner /></>;
  if (!project) return <><Navbar /><div className="page-content"><p>Project not found.</p></div></>;

  const isOwner = project.owner?._id === user?._id || project.owner === user?._id;

  return (
    <>
      <Navbar />
      <main className="page-content">
        {/* Project Header */}
        {editMode ? (
          <div className="form-card">
            <h3>Edit Project</h3>
            <form onSubmit={handleUpdateProject}>
              <label>
                Name
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                />
              </label>
              <label>
                Status
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="page-header">
            <div>
              <h1>{project.name}</h1>
              <p className="muted">{project.description || 'No description'}</p>
              <span className={`badge badge-${project.status}`}>{project.status}</span>
              <span className="muted" style={{ marginLeft: '1rem' }}>
                Owner: {project.owner?.name} &bull; {project.members?.length} member(s)
              </span>
            </div>
            {isOwner && (
              <div className="page-header-actions">
                <button className="btn-secondary btn-sm" onClick={() => setEditMode(true)}>Edit</button>
                <button className="btn-danger btn-sm" onClick={handleDeleteProject}>Delete Project</button>
              </div>
            )}
          </div>
        )}

        {/* Task Board */}
        <div className="section-header" style={{ marginTop: '2rem' }}>
          <h2>Tasks ({tasks.length})</h2>
          <button className="btn-primary btn-sm" onClick={() => setShowTaskForm((v) => !v)}>
            {showTaskForm ? 'Cancel' : '+ Add Task'}
          </button>
        </div>

        {showTaskForm && (
          <div className="form-card">
            <h3>New Task</h3>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleCreateTask}>
              <label>
                Title *
                <input
                  type="text"
                  name="title"
                  value={taskForm.title}
                  onChange={handleTaskChange}
                  placeholder="Task title"
                  required
                  autoFocus
                />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  value={taskForm.description}
                  onChange={handleTaskChange}
                  placeholder="Describe the task"
                  rows={2}
                />
              </label>
              <div className="form-row">
                <label>
                  Priority
                  <select name="priority" value={taskForm.priority} onChange={handleTaskChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Due Date
                  <input
                    type="date"
                    name="dueDate"
                    value={taskForm.dueDate}
                    onChange={handleTaskChange}
                  />
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Adding…' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Kanban Columns */}
        <div className="kanban-board">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col);
            return (
              <div key={col} className="kanban-col">
                <div className="kanban-col-header">
                  <span>{COL_LABEL[col]}</span>
                  <span className="kanban-count">{colTasks.length}</span>
                </div>
                <div className="kanban-tasks">
                  {colTasks.length === 0 ? (
                    <p className="kanban-empty">No tasks</p>
                  ) : (
                    colTasks.map((t) => (
                      <TaskCard
                        key={t._id}
                        task={t}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteTask}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
