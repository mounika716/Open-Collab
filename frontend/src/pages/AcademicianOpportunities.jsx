import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useLocation } from "react-router-dom";

import {
  createOpportunity,
  deleteOpportunity,
  getMyOpportunities,
  getOpportunities,
} from "../services/opportunityApi";

import "./AcademicianOpportunities.css";

const opportunityTypes = {
  faculty_internship: "Faculty Internship",
  industrial_training: "Industrial Training",
  fdp: "FDP",
  workshop: "Workshop",
  consultancy: "Consultancy",
  research: "Collaborative Research",
  guest_lecture: "Guest Lecture",
  mentorship: "Mentorship",
  live_project: "Live Industry Project",
  innovation_challenge: "Innovation Challenge",
};

const routeType = {
  "/academician/training": "industrial_training",
  "/academician/consultancy": "consultancy",
  "/academician/research": "research",
};

const emptyForm = {
  type: "faculty_internship",
  title: "",
  organization: "",
  description: "",
  skills: "",
  mode: "online",
  location: "",
  startDate: "",
  endDate: "",
  deadline: "",
  contactEmail: "",
  website: "",
  seats: 1,
};

function AcademicianOpportunities() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialType =
    routeType[location.pathname] ||
    "faculty_internship";

  const [opportunities, setOpportunities] =
    useState([]);

  const [myOpportunities, setMyOpportunities] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    ...emptyForm,
    type: initialType,
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const pageTitle = useMemo(() => {
    if (location.pathname === "/academician/training") {
      return "Training & FDP";
    }

    if (location.pathname === "/academician/consultancy") {
      return "Consultancy";
    }

    if (location.pathname === "/academician/research") {
      return "Research & Collaboration";
    }

    return "Academic opportunities";
  }, [location.pathname]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [allResponse, mineResponse] =
        await Promise.all([
          getOpportunities({
            type: initialType,
            status: "open",
          }),
          getMyOpportunities(),
        ]);

      setOpportunities(
        allResponse.opportunities || []
      );

      setMyOpportunities(
        mineResponse.opportunities || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load opportunities."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setForm((current) => ({
        ...current,
        type: initialType,
      }));

      loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [initialType]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await createOpportunity({
        ...form,
        skills: form.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        seats: Number(form.seats) || 1,
      });

      setMessage(
        "Opportunity published successfully."
      );

      setForm({
        ...emptyForm,
        type: initialType,
      });

      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create opportunity."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this opportunity?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteOpportunity(id);

      setMessage(
        "Opportunity deleted successfully."
      );

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete opportunity."
      );
    }
  };

  const visibleMine = myOpportunities.filter(
    (item) => item.type === initialType
  );

  return (
    <section className="academician-opportunities-page">
      <div className="academician-opportunities-header">
        <div>
          <p className="academician-opportunities-eyebrow">
            ACADEMICIAN ECOSYSTEM
          </p>

          <h1>{pageTitle}</h1>

          <p>
            Discover and publish real academic-industry
            opportunities for faculty collaboration,
            training and knowledge exchange.
          </p>
        </div>

        <button
          className="create-opportunity-button"
          onClick={() => {
            setForm({
              ...emptyForm,
              type: initialType,
            });
            setShowForm(true);
          }}
        >
          <Plus size={17} />
          Create opportunity
        </button>
      </div>

      {message && (
        <div className="academician-opportunity-success">
          {message}
        </div>
      )}

      {error && (
        <div className="academician-opportunity-error">
          {error}
        </div>
      )}

      {showForm && (
        <div className="opportunity-form-overlay">
          <div className="opportunity-form-card">
            <div className="opportunity-form-header">
              <div>
                <p>NEW OPPORTUNITY</p>
                <h2>Create an opportunity</h2>
              </div>

              <button
                className="close-opportunity-form"
                onClick={() => setShowForm(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="opportunity-form-grid">
                <div className="opportunity-form-field">
                  <label>Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    {Object.entries(
                      opportunityTypes
                    ).map(([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="opportunity-form-field">
                  <label>Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Industry AI Research Collaboration"
                    required
                  />
                </div>

                <div className="opportunity-form-field">
                  <label>Organization</label>
                  <input
                    name="organization"
                    value={form.organization}
                    onChange={handleChange}
                    placeholder="Organization name"
                    required
                  />
                </div>

                <div className="opportunity-form-field">
                  <label>Mode</label>
                  <select
                    name="mode"
                    value={form.mode}
                    onChange={handleChange}
                  >
                    <option value="online">
                      Online
                    </option>
                    <option value="offline">
                      Offline
                    </option>
                    <option value="hybrid">
                      Hybrid
                    </option>
                  </select>
                </div>

                <div className="opportunity-form-field">
                  <label>Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Hyderabad / Remote"
                  />
                </div>

                <div className="opportunity-form-field">
                  <label>Seats</label>
                  <input
                    type="number"
                    min="1"
                    name="seats"
                    value={form.seats}
                    onChange={handleChange}
                  />
                </div>

                <div className="opportunity-form-field opportunity-form-wide">
                  <label>Required skills</label>
                  <input
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="AI, Python, Research, IoT"
                  />
                </div>

                <div className="opportunity-form-field opportunity-form-wide">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Describe the opportunity, expected contribution and outcomes."
                    required
                  />
                </div>

                <div className="opportunity-form-field">
                  <label>Start date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="opportunity-form-field">
                  <label>End date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="opportunity-form-field">
                  <label>Application deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                  />
                </div>

                <div className="opportunity-form-field">
                  <label>Contact email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={handleChange}
                    placeholder="contact@example.com"
                  />
                </div>

                <div className="opportunity-form-field opportunity-form-wide">
                  <label>Website</label>
                  <input
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="opportunity-form-actions">
                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="opportunity-cancel-button"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="opportunity-submit-button"
                >
                  {saving
                    ? "Publishing..."
                    : "Publish opportunity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="opportunity-section-heading">
        <div>
          <h2>Available opportunities</h2>
          <p>
            Open opportunities matching this academic
            category.
          </p>
        </div>

        <span>
          {opportunities.length} available
        </span>
      </div>

      {loading ? (
        <div className="opportunity-empty">
          Loading opportunities...
        </div>
      ) : opportunities.length === 0 ? (
        <div className="opportunity-empty">
          <BriefcaseBusiness size={28} />
          <h3>No opportunities yet</h3>
          <p>
            Create the first opportunity for this category.
          </p>
        </div>
      ) : (
        <div className="opportunity-card-grid">
          {opportunities.map((opportunity) => (
            <article
              className="academia-opportunity-card"
              key={opportunity._id}
            >
              <div className="opportunity-card-top">
                <span className="opportunity-type">
                  {opportunityTypes[
                    opportunity.type
                  ] || opportunity.type}
                </span>

                <span className="opportunity-mode">
                  {opportunity.mode}
                </span>
              </div>

              <h3>{opportunity.title}</h3>

              <p className="opportunity-organization">
                {opportunity.organization}
              </p>

              <p className="opportunity-description">
                {opportunity.description}
              </p>

              {opportunity.skills?.length > 0 && (
                <div className="opportunity-skills">
                  {opportunity.skills.map(
                    (skill) => (
                      <span key={skill}>
                        {skill}
                      </span>
                    )
                  )}
                </div>
              )}

              <div className="opportunity-card-meta">
                {opportunity.location && (
                  <span>
                    {opportunity.location}
                  </span>
                )}

                {opportunity.deadline && (
                  <span>
                    <CalendarDays size={13} />
                    {new Date(
                      opportunity.deadline
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {visibleMine.length > 0 && (
        <>
          <div className="opportunity-section-heading my-opportunities-heading">
            <div>
              <h2>My opportunities</h2>
              <p>
                Opportunities you have published.
              </p>
            </div>
          </div>

          <div className="my-opportunity-list">
            {visibleMine.map((opportunity) => (
              <div
                className="my-opportunity-row"
                key={opportunity._id}
              >
                <div>
                  <strong>
                    {opportunity.title}
                  </strong>

                  <span>
                    {opportunityTypes[
                      opportunity.type
                    ]}
                    {" · "}
                    {opportunity.status}
                  </span>
                </div>

                <div className="my-opportunity-actions">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/academician/opportunities/${opportunity._id}/requests`
                    )
                  }
                  title="Manage collaboration requests"
                >
                  Manage Requests
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(opportunity._id)
                  }
                  title="Delete opportunity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default AcademicianOpportunities;

