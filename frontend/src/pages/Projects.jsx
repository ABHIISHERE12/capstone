import { useEffect, useState } from "react";
import { getProjects, createProject, deleteProject } from "../api/projectApi";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import Spinner from "../components/Spinner";

const INITIAL_FORM = { name: "", description: "" };

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Define the fetcher inside the effect to satisfy react-hooks/set-state-in-effect
    const loadProjects = async () => {
      try {
        const res = await getProjects();
        setProjects(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await createProject(form);
      setProjects((prev) => [res.data, ...prev]);
      setForm(INITIAL_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project");
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <Spinner />
      </>
    );

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="page-header">
          <h1>Projects</h1>
          <button
            className="btn-primary"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Cancel" : "+ New Project"}
          </button>
        </div>

        {showForm && (
          <div className="form-card">
            <h3>Create New Project</h3>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleCreate}>
              <label>
                Project Name *
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="My Awesome Project"
                  required
                  autoFocus
                />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="What is this project about?"
                  rows={3}
                />
              </label>
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? "Creating…" : "Create Project"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setForm(INITIAL_FORM);
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects found. Create your first project above!</p>
          </div>
        ) : (
          <div className="cards-grid">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
