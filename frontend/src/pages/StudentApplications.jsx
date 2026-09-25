import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  PlayCircle,
  RefreshCw,
  Star,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getMyApplications } from "../services/applicationApi";

import "./StudentApplications.css";

function StudentApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
   const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyApplications();

      setApplications(response.applications || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your applications."
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      loadApplications();
    }, 0);

    return () => clearTimeout(timer);
  }, []);



  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    if (
      status === "accepted" ||
      status === "shortlisted" ||
      status === "completed"
    ) {
      return <CheckCircle2 size={15} />;
    }

    if (status === "rejected") {
      return <XCircle size={15} />;
    }

    if (
      status === "joined" ||
      status === "in_progress"
    ) {
      return <PlayCircle size={15} />;
    }

    return <Clock3 size={15} />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      shortlisted: "Shortlisted",
      accepted: "Accepted",
      rejected: "Rejected",
      joined: "Joined",
      in_progress: "In Progress",
      completed: "Completed",
    };

    return labels[status] || status;
  };

  const isStageActive = (status, stage) => {
    const stages = [
      "pending",
      "shortlisted",
      "accepted",
      "joined",
      "in_progress",
      "completed",
    ];

    if (status === "rejected") {
      return stage === "pending";
    }

    const currentIndex = stages.indexOf(status);
    const stageIndex = stages.indexOf(stage);

    return (
      currentIndex >= 0 &&
      stageIndex >= 0 &&
      currentIndex >= stageIndex
    );
  };

  if (loading) {
    return (
      <div className="applications-state">
        <RefreshCw
          size={19}
          className="applications-spin"
        />
        Loading your applications...
      </div>
    );
  }

  return (
    <div className="student-applications-page">
      <header className="student-applications-header">
        <div>
          <span className="applications-eyebrow">
            APPLICATIONS
          </span>

          <h1>My Applications</h1>

          <p>
            Track the internships you have applied for
            and follow your application progress.
          </p>
        </div>

        <div className="applications-count">
          <strong>{applications.length}</strong>
          <span>Applications</span>
        </div>
      </header>

      {error && (
        <section className="applications-error">
          <XCircle size={18} />

          <div>
            <strong>Unable to load applications</strong>
            <p>{error}</p>
          </div>

          <button onClick={loadApplications}>
            Try again
          </button>
        </section>
      )}

      {!error && applications.length === 0 && (
        <section className="applications-empty">
          <div className="applications-empty-icon">
            <BriefcaseBusiness size={24} />
          </div>

          <h2>No applications yet</h2>

          <p>
            Explore internships and apply to opportunities
            that match your skills.
          </p>

          <button
            onClick={() =>
              navigate("/student/internships")
            }
          >
            Explore internships
            <ArrowRight size={15} />
          </button>
        </section>
      )}

      {!error && applications.length > 0 && (
        <section className="applications-list">
          {applications.map((application) => {
            const internship = application.internship;
            const status = application.status;

            return (
              <article
                className="application-card"
                key={application._id}
              >
                <div className="application-company-mark">
                  {internship?.companyName
                    ?.charAt(0)
                    .toUpperCase() || "I"}
                </div>

                <div className="application-main">
                  <div className="application-heading">
                    <div>
                      <span className="application-company">
                        {internship?.companyName ||
                          "Company"}
                      </span>

                      <h2>
                        {internship?.title ||
                          "Internship opportunity"}
                      </h2>
                    </div>

                    <span
                      className={`application-status ${status}`}
                    >
                      {getStatusIcon(status)}
                      {getStatusLabel(status)}
                    </span>
                  </div>

                  <div className="application-meta">
                    <span>
                      <CalendarDays size={14} />
                      Applied{" "}
                      {formatDate(application.appliedAt)}
                    </span>

                    <span>
                      <BriefcaseBusiness size={14} />
                      {internship?.type || "Internship"}
                    </span>

                    <span>
                      Match{" "}
                      <strong>
                        {application.matchPercentage ?? 0}%
                      </strong>
                    </span>
                  </div>

                  <div className="student-internship-lifecycle">
                    <div
                      className={
                        isStageActive(status, "pending")
                          ? "active"
                          : ""
                      }
                    >
                      <span className="lifecycle-dot" />
                      <label>Applied</label>
                    </div>

                    <div
                      className={
                        isStageActive(
                          status,
                          "shortlisted"
                        )
                          ? "active"
                          : ""
                      }
                    >
                      <span className="lifecycle-dot" />
                      <label>Shortlisted</label>
                    </div>

                    <div
                      className={
                        isStageActive(status, "accepted")
                          ? "active"
                          : ""
                      }
                    >
                      <span className="lifecycle-dot" />
                      <label>Accepted</label>
                    </div>

                    <div
                      className={
                        isStageActive(status, "joined")
                          ? "active"
                          : ""
                      }
                    >
                      <span className="lifecycle-dot" />
                      <label>Joined</label>
                    </div>

                    <div
                      className={
                        isStageActive(
                          status,
                          "in_progress"
                        )
                          ? "active"
                          : ""
                      }
                    >
                      <span className="lifecycle-dot" />
                      <label>In Progress</label>
                    </div>

                    <div
                      className={
                        isStageActive(
                          status,
                          "completed"
                        )
                          ? "active"
                          : ""
                      }
                    >
                      <span className="lifecycle-dot" />
                      <label>Completed</label>
                    </div>
                  </div>

                  {status === "rejected" && (
                    <div className="application-rejected-note">
                      <XCircle size={14} />
                      This application was not selected for
                      the internship.
                    </div>
                  )}

                  {status !== "rejected" && (
                    <div className="application-dates">
                      {application.acceptedAt && (
                        <span>
                          Accepted{" "}
                          {formatDate(
                            application.acceptedAt
                          )}
                        </span>
                      )}

                      {application.joinedAt && (
                        <span>
                          Joined{" "}
                          {formatDate(
                            application.joinedAt
                          )}
                        </span>
                      )}

                      {application.startedAt && (
                        <span>
                          Started{" "}
                          {formatDate(
                            application.startedAt
                          )}
                        </span>
                      )}

                      {application.completedAt && (
                        <span>
                          Completed{" "}
                          {formatDate(
                            application.completedAt
                          )}
                        </span>
                      )}
                    </div>
                  )}
                  {status === "completed" && (
  <section className="internship-outcome">
    <div className="outcome-header">
      <div>
        <span className="outcome-eyebrow">
          INTERNSHIP OUTCOME
        </span>

        <h3>
          Completion & Evaluation
        </h3>
      </div>

      {application.evaluation?.rating && (
        <div className="evaluation-rating">
          <Star size={14} fill="currentColor" />

          <strong>
            {application.evaluation.rating}
          </strong>

          <span>/ 5</span>
        </div>
      )}
    </div>

    {application.evaluation ? (
      <div className="evaluation-content">
        {application.evaluation.feedback && (
          <div className="evaluation-feedback">
            <span>INDUSTRY FEEDBACK</span>

            <p>
              {application.evaluation.feedback}
            </p>
          </div>
        )}

        {application.evaluation
          .skillsDemonstrated?.length > 0 && (
          <div className="demonstrated-skills">
            <span>SKILLS DEMONSTRATED</span>

            <div>
              {application.evaluation.skillsDemonstrated.map(
                (skill, index) => (
                  <span
                    className="skill-chip"
                    key={`${skill}-${index}`}
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {application.completionNote && (
          <div className="completion-note">
            <span>COMPLETION NOTE</span>

            <p>
              {application.completionNote}
            </p>
          </div>
        )}

        {application.evaluation.evaluatedAt && (
          <span className="evaluated-date">
            Evaluated{" "}
            {formatDate(
              application.evaluation.evaluatedAt
            )}
          </span>
        )}
      </div>
    ) : (
      <div className="outcome-pending">
        <Clock3 size={15} />

        <span>
          Your internship is completed. The industry
          evaluation is pending.
        </span>
      </div>
    )}

    {application.certificate?.issued ? (
      <div className="certificate-card">
        <div className="certificate-icon">
          <Award size={20} />
        </div>

        <div className="certificate-details">
          <span>CERTIFICATE</span>

          <h4>
            {application.certificate.name ||
              "Internship Certificate"}
          </h4>

          <p>
            Issued by{" "}
            {application.certificate.issuer ||
              "Industry Partner"}
          </p>

          {application.certificate.issueDate && (
            <small>
              Issued{" "}
              {formatDate(
                application.certificate.issueDate
              )}
            </small>
          )}
        </div>

        {application.certificate.url && (
          <a
            href={application.certificate.url}
            target="_blank"
            rel="noreferrer"
            className="certificate-link"
          >
            View
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    ) : (
      application.evaluation && (
        <div className="certificate-pending">
          <Award size={15} />

          <span>
            Your certificate has not been issued yet.
          </span>
        </div>
      )
    )}
  </section>
)}

                  <div className="application-footer">
                    <span>
                      Application ID:{" "}
                      {application._id}
                    </span>

                    {internship?._id && (
                      <button
                        onClick={() =>
                          navigate(
                            `/student/internships/${internship._id}`
                          )
                        }
                      >
                        View internship
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default StudentApplications;
