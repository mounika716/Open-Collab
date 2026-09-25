import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createInternship,
  deleteInternship,
  getMyInternships,
  updateInternship,
} from "../services/industryApi";

import "./IndustryInternships.css";

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
  duration: "",
  stipend: "",
  applicationDeadline: "",
  openings: 1,
  status: "open",
  requiredSkills: [{ ...emptySkill }],
};

function IndustryInternships() {
  const [internships, setInternships] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadInternships = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyInternships();

      setInternships(data.internships || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your internships."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInternships();
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
    setForm(initialForm);
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
      !form.duration.trim() ||
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
      duration: form.duration.trim(),
      stipend: form.stipend.trim(),
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
        await updateInternship(editingId, payload);
        setMessage("Internship updated successfully.");
      } else {
        await createInternship(payload);
        setMessage("Internship created successfully.");
      }

      await loadInternships();
      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save internship."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (internship) => {
    const deadline = internship.applicationDeadline
      ? new Date(internship.applicationDeadline)
          .toISOString()
          .split("T")[0]
      : "";

    setForm({
      companyName: internship.companyName || "",
      title: internship.title || "",
      description: internship.description || "",
      location: internship.location || "Remote",
      type: internship.type || "remote",
      duration: internship.duration || "",
      stipend: internship.stipend || "",
      applicationDeadline: deadline,
      openings: internship.openings || 1,
      status: internship.status || "open",
      requiredSkills:
        internship.requiredSkills?.length > 0
          ? internship.requiredSkills.map((skill) => ({
              name: skill.name,
              minimumLevel: skill.minimumLevel,
            }))
          : [{ ...emptySkill }],
    });

    setEditingId(internship._id);
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
      "Are you sure you want to delete this internship?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await deleteInternship(id);

      setInternships((current) =>
        current.filter((internship) => internship._id !== id)
      );

      setMessage("Internship deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete internship."
      );
    }
  };

  return (
    <div className="industry-internships-page">
      <section className="industry-page-header">
        <div>
          <span className="industry-eyebrow">
            INDUSTRY WORKSPACE
          </span>

          <h1>Internship Management</h1>

          <p>
            Create opportunities, define required skills and
            manage your active internship postings.
          </p>
        </div>

        <button
          className="industry-primary-button"
          onClick={() => {
            setEditingId(null);
            setForm(initialForm);
            setShowForm(true);
            setMessage("");
            setError("");
          }}
        >
          <Plus size={18} />
          Create Internship
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
        <section className="internship-form-card">
          <div className="form-card-header">
            <div>
              <span className="industry-eyebrow">
                {editingId ? "EDIT POSTING" : "NEW POSTING"}
              </span>

              <h2>
                {editingId
                  ? "Update internship"
                  : "Create an internship"}
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
                Internship Title *
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Frontend Developer Intern"
                />
              </label>

              <label className="full-width">
                Description *
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe the internship, responsibilities and expectations..."
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
                Duration *
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="3 months"
                />
              </label>

              <label>
                Stipend
                <input
                  name="stipend"
                  value={form.stipend}
                  onChange={handleChange}
                  placeholder="₹15,000 / month"
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
                    Define the minimum skill level required for
                    this internship.
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
                  ? "Update Internship"
                  : "Publish Internship"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="internship-list-section">
        <div className="section-heading">
          <div>
            <span className="industry-eyebrow">
              YOUR POSTINGS
            </span>

            <h2>Internships</h2>
          </div>

          <span className="posting-count">
            {internships.length} posting
            {internships.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading your internships...
          </div>
        ) : internships.length === 0 ? (
          <div className="empty-state">
            <BriefcaseBusiness size={36} />

            <h3>No internships yet</h3>

            <p>
              Create your first internship posting to start
              finding suitable students.
            </p>

            <button
              className="industry-primary-button"
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} />
              Create Internship
            </button>
          </div>
        ) : (
          <div className="internship-list">
            {internships.map((internship) => (
              <article
                className="industry-internship-card"
                key={internship._id}
              >
                <div className="internship-card-top">
                  <div className="company-icon">
                    <Building2 size={20} />
                  </div>

                  <div className="internship-title-area">
                    <h3>{internship.title}</h3>

                    <p>{internship.companyName}</p>
                  </div>

                  <span
                    className={`status-pill ${internship.status}`}
                  >
                    {internship.status}
                  </span>
                </div>

                <p className="internship-description">
                  {internship.description}
                </p>

                <div className="internship-meta">
                  <span>
                    <MapPin size={15} />
                    {internship.location}
                  </span>

                  <span>
                    <Clock3 size={15} />
                    {internship.duration}
                  </span>

                  <span>
                    {internship.openings} opening
                    {internship.openings !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="required-skills">
                  {internship.requiredSkills?.map(
                    (skill, index) => (
                      <span key={index}>
                        {skill.name} · {skill.minimumLevel}
                      </span>
                    )
                  )}
                </div>

                <div className="internship-card-actions">
                  <button
                    className="secondary-button"
                    onClick={() =>
                      handleEdit(internship)
                    }
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    className="danger-button"
                    onClick={() =>
                      handleDelete(internship._id)
                    }
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

export default IndustryInternships;
