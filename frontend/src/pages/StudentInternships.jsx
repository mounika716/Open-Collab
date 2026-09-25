import { useEffect, useState, useCallback } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getInternships } from "../services/internshipApi";

import "./StudentInternships.css";

function StudentInternships() {
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInternships = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getInternships();

      setInternships(data.internships || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load internships."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInternships();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadInternships]);

  const filteredInternships = internships.filter((internship) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    const skills = (internship.requiredSkills || [])
      .map((skill) => skill.name)
      .join(" ");

    return `${internship.title} ${internship.companyName} ${internship.location} ${skills}`
      .toLowerCase()
      .includes(query);
  });

  const formatDeadline = (date) => {
    if (!date) return "No deadline";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="student-internships-page">
      <header className="internships-header">
        <div>
          <span className="internships-eyebrow">
            OPEN COLLAB / OPPORTUNITIES
          </span>

          <h1>Internships</h1>

          <p>
            Discover internships that connect with your
            skills, interests and career direction.
          </p>
        </div>

        <button
          className="internships-refresh"
          onClick={loadInternships}
          disabled={loading}
        >
          <RefreshCw
            size={15}
            className={loading ? "internships-spin" : ""}
          />
          Refresh
        </button>
      </header>

      <section className="internships-toolbar">
        <div className="internships-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search internships, companies or skills..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="internship-count">
          <BriefcaseBusiness size={15} />
          {filteredInternships.length} opportunities
        </div>
      </section>

      {error && (
        <div className="internships-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="internships-loading">
          <RefreshCw
            size={18}
            className="internships-spin"
          />
          Loading opportunities...
        </div>
      ) : filteredInternships.length === 0 ? (
        <section className="internships-empty">
          <Sparkles size={28} />

          <h2>No internships found</h2>

          <p>
            {search
              ? "Try a different search."
              : "There are no open internships available right now."}
          </p>
        </section>
      ) : (
        <section className="internships-grid">
          {filteredInternships.map((internship) => (
            <article
              className="internship-card"
              key={internship._id}
            >
              <div className="internship-card-top">
                <div className="internship-company-mark">
                  {internship.companyName
                    ?.charAt(0)
                    .toUpperCase() || "I"}
                </div>

                <span className="internship-status">
                  Open
                </span>
              </div>

              <div className="internship-card-content">
                <span className="internship-company">
                  {internship.companyName}
                </span>

                <h2>{internship.title}</h2>

                <p className="internship-description">
                  {internship.description}
                </p>

                <div className="internship-meta">
                  <span>
                    <MapPin size={14} />
                    {internship.location || "Remote"}
                  </span>

                  <span>
                    <CalendarDays size={14} />
                    {formatDeadline(
                      internship.applicationDeadline
                    )}
                  </span>
                </div>

                <div className="internship-skills">
                  {(internship.requiredSkills || []).map(
                    (skill, index) => (
                      <span key={`${skill.name}-${index}`}>
                        {skill.name}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="internship-card-footer">
                <span>
                  {internship.duration} ·{" "}
                  {internship.type || "remote"}
                </span>

                <button
                  onClick={() =>
                    navigate(
                      `/student/internships/${internship._id}`
                    )
                  }
                >
                  View
                  <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default StudentInternships;
