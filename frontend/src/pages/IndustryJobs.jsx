import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createJob,
  deleteJob,
  getMyJobs,
  updateJob,
} from "../services/jobApi";

import "./IndustryJobs.css";

const emptySkill = {
  name: "",
  minimumLevel: "beginner",
};

const initialForm = {
  companyName: "",
  title: "",
  description: "",
  location: "Remote",
  type: "remote",
  salary: "",
  experience: "Fresher",
  applicationDeadline: "",
  openings: 1,
  status: "open",
  requiredSkills: [{ ...emptySkill }],
};

function IndustryJobs() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyJobs();

      setJobs(data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your job postings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadJobs();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSkillChange = (index, field, value) => {
    setForm((current) => {
      const skills = [...current.requiredSkills];

      skills[index] = {
        ...skills[index],
        [field]: value,
      };

      return {
        ...current,
        requiredSkills: skills,
      };
    });
  };

  const addSkill = () => {
    setForm((current) => ({
      ...current,
      requiredSkills: [
        ...current.requiredSkills,
        { ...emptySkill },
      ],
    }));
  };

  const removeSkill = (index) => {
    setForm((current) => {
      if (current.requiredSkills.length === 1) {
        return current;
      }

      return {
        ...current,
        requiredSkills: current.requiredSkills.filter(
          (_, skillIndex) => skillIndex !== index
        ),
      };
    });
  };

  const resetForm = () => {
    setForm({
      ...initialForm,
      requiredSkills: [{ ...emptySkill }],
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const validSkills = form.requiredSkills.filter(
      (skill) => skill.name.trim()
    );

    if (
      !form.companyName.trim() ||
      !form.title.trim() ||
      !form.description.trim() ||
      !form.applicationDeadline ||
      validSkills.length === 0
    ) {
      setError(
        "Please fill all required fields and add at least one skill."
      );
      return;
    }

    const deadline = new Date(
      `${form.applicationDeadline}T23:59:59`
    ).toISOString();

    const payload = {
      companyName: form.companyName.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim() || "Remote",
      type: form.type,
      salary: form.salary.trim() || "Not disclosed",
      experience: form.experience.trim() || "Fresher",
      applicationDeadline: deadline,
      openings: Number(form.openings) || 1,
      status: form.status,
      requiredSkills: validSkills.map((skill) => ({
        name: skill.name.trim(),
        minimumLevel: skill.minimumLevel,
      })),
    };

    try {
      setSaving(true);

      if (editingId) {
        await updateJob(editingId, payload);
        setMessage("Job updated successfully.");
      } else {
        await createJob(payload);
        setMessage("Job created successfully.");
      }

      await loadJobs();
      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save job posting."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (job) => {
    const deadline = job.applicationDeadline
      ? new Date(job.applicationDeadline)
          .toISOString()
          .split("T")[0]
      : "";

    setForm({
      companyName: job.companyName || "",
      title: job.title || "",
      description: job.description || "",
      location: job.location || "Remote",
      type: job.type || "remote",
      salary: job.salary || "",
      experience: job.experience || "Fresher",
      applicationDeadline: deadline,
      openings: job.openings || 1,
      status: job.status || "open",
      requiredSkills:
        job.requiredSkills?.length > 0
          ? job.requiredSkills.map((skill) => ({
              name: skill.name,
              minimumLevel: skill.minimumLevel,
            }))
          : [{ ...emptySkill }],
    });

    setEditingId(job._id);
    setShowForm(true);
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteJob(id);

      setJobs((current) =>
        current.filter((job) => job._id !== id)
      );

      setMessage("Job deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete job."
      );
    }
  };

  return (
    <div className="industry-jobs-page">
      <section className="industry-page-header">
        <div>
          <span className="industry-eyebrow">
            INDUSTRY WORKSPACE
          </span>

          <h1>Job Management</h1>

          <p>
            Publish job opportunities, define required skills
            and find students who match your requirements.
          </p>
        </div>

        <button
          className="industry-primary-button"
          onClick={() => {
            setEditingId(null);
            setForm({
              ...initialForm,
              requiredSkills: [{ ...emptySkill }],
            });
            setShowForm(true);
            setMessage("");
            setError("");
          }}
        >
          <Plus size={18} />
          Create Job
        </button>
      </section>

      {message && (
        <div className="industry-message success">
          {message}
        </div>
      )}

      {error && (
        <div className="industry-message error">
          {error}
        </div>
      )}

      {showForm && (
        <section className="job-form-card">
          <div className="form-card-header">
            <div>
              <span className="industry-eyebrow">
                {editingId ? "EDIT POSTING" : "NEW POSTING"}
              </span>

              <h2>
                {editingId
                  ? "Update job"
                  : "Create a job"}
              </h2>
            </div>

            <button
              className="icon-button"
              onClick={resetForm}
              type="button"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Company Name *
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Example Technologies"
                />
              </label>

              <label>
                Job Title *
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                />
              </label>

              <label className="full-width">
                Description *
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe the role, responsibilities and expectations..."
                />
              </label>

              <label>
                Location
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Hyderabad / Remote"
                />
              </label>

              <label>
                Work Type
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </label>

              <label>
                Salary
                <input
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="₹6 - ₹10 LPA"
                />
              </label>

              <label>
                Experience
                <input
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="Fresher / 1-2 years"
                />
              </label>

              <label>
                Application Deadline *
                <input
                  type="date"
                  name="applicationDeadline"
                  value={form.applicationDeadline}
                  onChange={handleChange}
                />
              </label>

              <label>
                Openings
                <input
                  type="number"
                  min="1"
                  name="openings"
                  value={form.openings}
                  onChange={handleChange}
                />
              </label>

              {editingId && (
                <label>
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
              )}
            </div>

            <div className="skills-editor">
              <div className="skills-editor-header">
                <div>
                  <h3>Required Skills</h3>
                  <p>
                    Define the minimum skill level required
                    for this job.
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={addSkill}
                >
                  <Plus size={16} />
                  Add Skill
                </button>
              </div>

              <div className="skill-input-list">
                {form.requiredSkills.map((skill, index) => (
                  <div
                    className="skill-input-row"
                    key={index}
                  >
                    <input
                      value={skill.name}
                      onChange={(event) =>
                        handleSkillChange(
                          index,
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="Skill name e.g. React"
                    />

                    <select
                      value={skill.minimumLevel}
                      onChange={(event) =>
                        handleSkillChange(
                          index,
                          "minimumLevel",
                          event.target.value
                        )
                      }
                    >
                      <option value="beginner">
                        Beginner
                      </option>

                      <option value="intermediate">
                        Intermediate
                      </option>

                      <option value="advanced">
                        Advanced
                      </option>
                    </select>

                    <button
                      type="button"
                      className="remove-skill-button"
                      onClick={() => removeSkill(index)}
                      disabled={
                        form.requiredSkills.length === 1
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="industry-primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Job"
                  : "Publish Job"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="job-list-section">
        <div className="section-heading">
          <div>
            <span className="industry-eyebrow">
              YOUR POSTINGS
            </span>

            <h2>Jobs</h2>
          </div>

          <span className="posting-count">
            {jobs.length} posting
            {jobs.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading your jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <BriefcaseBusiness size={36} />

            <h3>No jobs yet</h3>

            <p>
              Create your first job posting to start finding
              suitable candidates.
            </p>

            <button
              className="industry-primary-button"
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} />
              Create Job
            </button>
          </div>
        ) : (
          <div className="job-list">
            {jobs.map((job) => (
              <article
                className="industry-job-card"
                key={job._id}
              >
                <div className="job-card-top">
                  <div className="company-icon">
                    <Building2 size={20} />
                  </div>

                  <div className="job-title-area">
                    <h3>{job.title}</h3>
                    <p>{job.companyName}</p>
                  </div>

                  <span
                    className={`status-pill ${job.status}`}
                  >
                    {job.status}
                  </span>
                </div>

                <p className="job-description">
                  {job.description}
                </p>

                <div className="job-meta">
                  <span>
                    <MapPin size={15} />
                    {job.location}
                  </span>

                  <span>
                    {job.type}
                  </span>

                  <span>
                    {job.experience}
                  </span>

                  <span>
                    {job.openings} opening
                    {job.openings !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="job-salary">
                  {job.salary || "Not disclosed"}
                </div>

                <div className="required-skills">
                  {job.requiredSkills?.map(
                    (skill, index) => (
                      <span key={index}>
                        {skill.name} · {skill.minimumLevel}
                      </span>
                    )
                  )}
                </div>

                <div className="job-card-actions">
                  <button
                    className="secondary-button"
                    onClick={() => handleEdit(job)}
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    className="danger-button"
                    onClick={() => handleDelete(job._id)}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default IndustryJobs;
