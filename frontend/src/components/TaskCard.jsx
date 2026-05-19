const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
const STATUS_LABELS   = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };

export default function TaskCard({ task, onStatusChange, onDelete }) {
  return (
    <div className="card task-card">
      <div className="card-header">
        <h4>{task.title}</h4>
        <span
          className="badge"
          style={{ background: PRIORITY_COLORS[task.priority] || '#94a3b8' }}
        >
          {task.priority}
        </span>
      </div>
      <p className="card-desc">{task.description || 'No description'}</p>
      <div className="card-meta">
        <span>Assigned: {task.assignedTo?.name || 'Unassigned'}</span>
        {task.dueDate && (
          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        )}
      </div>
      <div className="card-actions">
        <select
          value={task.status}
          onChange={(e) => onStatusChange && onStatusChange(task._id, e.target.value)}
          className="status-select"
        >
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        {onDelete && (
          <button
            onClick={() => onDelete(task._id)}
            className="btn-danger btn-sm"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
