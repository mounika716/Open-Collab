import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getInternship,
  getInternshipMatch,
} from "../services/internshipApi";

import {
  applyForInternship,
  getMyApplications,
} from "../services/applicationApi";

import "./StudentInternshipDetails.css";

function StudentInternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [internship, setInternship] = useState(null);
  const [match, setMatch] = useState(null);

  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(true);
  const [error, setError] = useState("");
  const [application, setApplication] = useState(null);
  const [coverMessage, setCoverMessage] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applicationError, setApplicationError] = useState("");

  async function loadDetails() {
    try {
      setLoading(true);
      setMatchLoading(true);
      setError("");

      const [
        internshipData,
        matchData,
        applicationsData,
      ] = await Promise.all([
        getInternship(id),
        getInternshipMatch(id),
        getMyApplications(),
      ]);

      setInternship(
        internshipData.internship || null
      );

      setMatch(matchData);

      const myApplications =
        applicationsData.applications || [];

      const existingApplication =
        myApplications.find(
          (item) =>
            item.internship?._id === id
        );

      setApplication(
        existingApplication || null
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load internship details."
      );
    } finally {
      setLoading(false);
      setMatchLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDetails();
    }, 0);

    return () => clearTimeout(timer);
  }, [id]);

  const formatDeadline = (date) => {
    if (!date) return "No deadline";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleApply = async () => {
    try {
      setApplyLoading(true);
      setApplicationError("");
      setApplicationMessage("");

      const response = await applyForInternship(
        id,
        coverMessage
      );

      setApplication(
        response.application || null
      );

      setApplicationMessage(
        response.message ||
          "Application submitted successfully."
      );

      setCoverMessage("");
    } catch (err) {
      setApplicationError(
        err.response?.data?.message ||
          "Unable to submit your application."
      );
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="internship-details-state">
        <RefreshCw
          className="internship-details-spin"
          size={20}
        />
        Loading internship...
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="internship-details-page">
        <button
          className="internship-back-button"
          onClick={() =>
            navigate("/student/internships")
          }
        >
          <ArrowLeft size={15} />
          Back to internships
        </button>

        <section className="internship-details-error">
          <XCircle size={30} />

          <h2>
            Unable to load internship
          </h2>

          <p>
            {error || "Internship not found."}
          </p>

          <button onClick={loadDetails}>
            Try again
          </button>
        </section>
      </div>
    );
  }

  const skillResults = match?.skills || [];

  const matchedSkills =
    skillResults.filter(
      (skill) => skill.matched
    );

  const missingSkills =
    skillResults.filter(
      (skill) => !skill.matched
    );

  return (
    <div className="internship-details-page">
      <button
        className="internship-back-button"
        onClick={() =>
          navigate("/student/internships")
        }
      >
        <ArrowLeft size={15} />
        Back to internships
      </button>

      <header className="internship-details-header">
        <div className="internship-details-company-mark">
          {internship.companyName
            ?.charAt(0)
            .toUpperCase() || "I"}
        </div>

        <div className="internship-details-heading">
          <span>
            {internship.companyName}
          </span>

          <h1>{internship.title}</h1>

          <p>
            {internship.description}
          </p>
        </div>

        <div className="internship-open-badge">
          {internship.status === "open"
            ? "Open"
            : "Closed"}
        </div>
      </header>

      <section className="internship-details-layout">
        <main>
          <section className="internship-info-card">
            <div className="internship-info-grid">
              <div>
                <MapPin size={16} />

                <span>
                  <small>Location</small>
                  {internship.location ||
                    "Remote"}
                </span>
              </div>

              <div>
                <BriefcaseBusiness size={16} />

                <span>
                  <small>Work type</small>
                  {internship.type ||
                    "Remote"}
                </span>
              </div>

              <div>
                <Clock3 size={16} />

                <span>
                  <small>Duration</small>
                  {internship.duration}
                </span>
              </div>

              <div>
                <Users size={16} />

                <span>
                  <small>Openings</small>
                  {internship.openings || 1}
                </span>
              </div>

              <div>
                <Sparkles size={16} />

                <span>
                  <small>Stipend</small>
                  {internship.stipend ||
                    "Unpaid"}
                </span>
              </div>

              <div>
                <CalendarDays size={16} />

                <span>
                  <small>Deadline</small>

                  {formatDeadline(
                    internship.applicationDeadline
                  )}
                </span>
              </div>
            </div>
          </section>

          <section className="internship-section-card">
            <div className="internship-section-heading">
              <span>01</span>

              <div>
                <h2>Required skills</h2>

                <p>
                  Skills expected for this
                  opportunity.
                </p>
              </div>
            </div>

            <div className="required-skills-list">
              {(
                internship.requiredSkills || []
              ).map((skill, index) => (
                <div
                  className="required-skill"
                  key={`${skill.name}-${index}`}
                >
                  <span>{skill.name}</span>

                  <small>
                    {skill.minimumLevel}
                  </small>
                </div>
              ))}
            </div>
          </section>

          <section className="internship-section-card">
            <div className="internship-section-heading">
              <span>02</span>

              <div>
                <h2>Your skill match</h2>

                <p>
                  Based on your current Open
                  Collab skill profile.
                </p>
              </div>
            </div>

            {matchLoading ? (
              <div className="match-loading">
                <RefreshCw
                  size={16}
                  className="internship-details-spin"
                />

                Calculating your match...
              </div>
            ) : (
              <>
                <div className="match-summary">
                  <div className="match-score">
                    <strong>
                      {match?.matchPercentage ??
                        0}
                      %
                    </strong>

                    <span>
                      skill match
                    </span>
                  </div>

                  <div className="match-summary-text">
                    <p>
                      {matchedSkills.length} of{" "}
                      {skillResults.length}{" "}
                      required skills meet the
                      internship requirements.
                    </p>
                  </div>
                </div>

                <div className="match-columns">
                  <div>
                    <h3>
                      <CheckCircle2 size={15} />
                      Matched
                    </h3>

                    {matchedSkills.length ===
                    0 ? (
                      <p className="match-empty">
                        No required skills matched
                        yet.
                      </p>
                    ) : (
                      <div className="match-skill-list">
                        {matchedSkills.map(
                          (skill, index) => (
                            <div
                              className="match-skill matched"
                              key={`${skill.skill}-${index}`}
                            >
                              <div>
                                <strong>
                                  {skill.skill}
                                </strong>

                                <span>
                                  Required:{" "}
                                  {
                                    skill.requiredLevel
                                  }
                                </span>
                              </div>

                              <small>
                                {
                                  skill.studentLevel
                                }
                              </small>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3>
                      <XCircle size={15} />
                      Needs improvement
                    </h3>

                    {missingSkills.length ===
                    0 ? (
                      <p className="match-empty">
                        All required skills are
                        currently matched.
                      </p>
                    ) : (
                      <div className="match-skill-list">
                        {missingSkills.map(
                          (skill, index) => (
                            <div
                              className="match-skill missing"
                              key={`${skill.skill}-${index}`}
                            >
                              <div>
                                <strong>
                                  {skill.skill}
                                </strong>

                                <span>
                                  Required:{" "}
                                  {
                                    skill.requiredLevel
                                  }
                                </span>
                              </div>

                              <small>
                                {skill.studentLevel ||
                                  "Not added"}
                              </small>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </main>

        <aside>
          <section className="internship-apply-card">
            <span className="apply-eyebrow">
              APPLICATION
            </span>

            <h2>
              Interested in this opportunity?
            </h2>

            <p>
              Your profile and skill information
              will be used when you apply.
            </p>

            {applicationMessage && (
              <div className="application-message success">
                {applicationMessage}
              </div>
            )}

            {applicationError && (
              <div className="application-message error">
                {applicationError}
              </div>
            )}

            {application ? (
              <div className="application-status-box">
                <div>
                  <CheckCircle2 size={18} />

                  <strong>
                    Application submitted
                  </strong>
                </div>

                <span
                  className={`application-status ${application.status}`}
                >
                  {application.status}
                </span>

                <p>
                  Match at application time:{" "}
                  {application.matchPercentage ??
                    0}
                  %
                </p>
              </div>
            ) : (
              <>
                {internship.status === "open" && (
                  <textarea
                    className="application-cover-message"
                    value={coverMessage}
                    onChange={(event) =>
                      setCoverMessage(
                        event.target.value
                      )
                    }
                    placeholder="Write a short message to the company (optional)"
                    maxLength={2000}
                  />
                )}

                <button
                  className="apply-button"
                  onClick={handleApply}
                  disabled={
                    internship.status !==
                      "open" ||
                    applyLoading
                  }
                >
                  {applyLoading
                    ? "Submitting..."
                    : internship.status === "open"
                      ? "Apply for internship"
                      : "Applications closed"}
                </button>
              </>
            )}

            <button
              className="profile-button"
              onClick={() =>
                navigate("/student/profile")
              }
            >
              Review my profile
            </button>
          </section>

          <section className="internship-company-card">
            <span>POSTED BY</span>

            <h3>
              {internship.companyName}
            </h3>

            {internship.industry?.name && (
              <p>
                Contact:{" "}
                {internship.industry.name}
              </p>
            )}
          </section>
        </aside>
      </section>
    </div>
  );
}

export default StudentInternshipDetails;


