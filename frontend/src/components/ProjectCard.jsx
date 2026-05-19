import { Link } from 'react-router-dom';

const STATUS_COLORS = {
  active: '#22c55e',
  completed: '#3b82f6',
  archived: '#94a3b8',
};

export default function ProjectCard({ project, onDelete }) {
  return (
    <div className="card project-card">
      <div className="card-header">
        <h3>
          <Link to={`/projects/${project._id}`}>{project.name}</Link>
        </h3>
        <span
          className="badge"
          style={{ background: STATUS_COLORS[project.status] || '#94a3b8' }}
        >
          {project.status}
        </span>
      </div>
      <p className="card-desc">{project.description || 'No description'}</p>
      <div className="card-meta">
        <span>Owner: {project.owner?.name || 'Unknown'}</span>
        <span>Members: {project.members?.length ?? 0}</span>
      </div>
      <div className="card-actions">
        <Link to={`/projects/${project._id}`} className="btn-secondary btn-sm">
          View
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(project._id)}
            className="btn-danger btn-sm"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
