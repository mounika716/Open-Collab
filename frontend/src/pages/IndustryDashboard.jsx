import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  RefreshCw,
  Users,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  getMyInternships,
  getIndustryDemand,
} from "../services/industryApi";
import {
  getInternshipApplications,
} from "../services/applicationApi";

import "./IndustryDashboard.css";

function IndustryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [demand, setDemand] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [internshipResponse, demandResponse] =
        await Promise.all([
          getMyInternships(),
          getIndustryDemand(),
        ]);

      const myInternships =
        internshipResponse.internships || [];

      setDemand(demandResponse);
      setInternships(myInternships);

      if (myInternships.length === 0) {
        setApplications([]);
        return;
      }

      const applicationResults =
        await Promise.all(
          myInternships.map(async (internship) => {
            try {
              const response =
                await getInternshipApplications(
                  internship._id
                );

              return (
                response.applications || []
              ).map((application) => ({
                ...application,
                internshipInfo: internship,
              }));
            } catch (applicationError) {
              console.error(
                "Application loading error:",
                applicationError
              );

              return [];
            }
          })
        );

      setApplications(
        applicationResults.flat()
      );
    } catch (err) {
      console.error(
        "Industry dashboard error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load industry dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboard();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const openInternships =
    internships.filter(
      (internship) =>
        internship.status === "open"
    );

  const closedInternships =
    internships.filter(
      (internship) =>
        internship.status === "closed"
    );

  const shortlisted =
    applications.filter(
      (application) =>
        application.status === "shortlisted"
    );

  const accepted =
    applications.filter(
      (application) =>
        application.status === "accepted"
    );

  const pending =
    applications.filter(
      (application) =>
        application.status === "pending"
    );

  const recentApplications =
    [...applications]
      .sort(
        (a, b) =>
          new Date(
            b.appliedAt || b.createdAt
          ) -
          new Date(
            a.appliedAt || a.createdAt
          )
      )
      .slice(0, 6);

  const getStatusIcon = (status) => {
    if (status === "shortlisted") {
      return <UserCheck size={14} />;
    }

    if (status === "accepted") {
      return <CheckCircle2 size={14} />;
    }

    if (status === "rejected") {
      return <XCircle size={14} />;
    }

    return <Clock3 size={14} />;
  };

  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="industry-dashboard">
      <header className="industry-dashboard-header">
        <div>
          <p className="industry-dashboard-eyebrow">
            INDUSTRY WORKSPACE
          </p>

          <h1>
            Welcome,{" "}
            <span>
              {user?.name || "Industry Partner"}
            </span>
          </h1>

          <p className="industry-dashboard-intro">
            Manage opportunities, review applicants
            and connect with students whose skills
            match your requirements.
          </p>
        </div>

        <button
          className="industry-primary-button"
          onClick={() =>
            navigate("/industry/internships")
          }
        >
          <Plus size={17} />
          Create Internship
        </button>
      </header>

      {error && (
        <div className="industry-dashboard-error">
          <XCircle size={17} />
          <span>{error}</span>

          <button onClick={loadDashboard}>
            Retry
          </button>
        </div>
      )}

      <section className="industry-stat-grid">
        <article className="industry-stat-card">
          <div className="industry-stat-icon">
            <BriefcaseBusiness size={19} />
          </div>

          <span>Total postings</span>

          <strong>
            {loading ? "—" : internships.length}
          </strong>

          <small>
            {openInternships.length} active
          </small>
        </article>

        <article className="industry-stat-card">
          <div className="industry-stat-icon">
            <Users size={19} />
          </div>

          <span>Total applicants</span>

          <strong>
            {loading ? "—" : applications.length}
          </strong>

          <small>
            Across all internships
          </small>
        </article>

        <article className="industry-stat-card">
          <div className="industry-stat-icon">
            <UserCheck size={19} />
          </div>

          <span>Shortlisted</span>

          <strong>
            {loading ? "—" : shortlisted.length}
          </strong>

          <small>
            Candidates to review
          </small>
        </article>

        <article className="industry-stat-card">
          <div className="industry-stat-icon">
            <CheckCircle2 size={19} />
          </div>

          <span>Accepted</span>

          <strong>
            {loading ? "—" : accepted.length}
          </strong>

          <small>
            Successful applications
          </small>
        </article>
      </section>

      <section className="industry-dashboard-grid">
        <main className="industry-dashboard-main">
          <section className="industry-dashboard-card">
            <div className="industry-card-heading">
              <div>
                <span>OPPORTUNITIES</span>
                <h2>Your internships</h2>
              </div>

              <button
                onClick={() =>
                  navigate("/industry/internships")
                }
              >
                Manage
                <ArrowRight size={15} />
              </button>
            </div>

            {internships.length === 0 ? (
              <div className="industry-empty-state">
                <BriefcaseBusiness size={25} />

                <h3>
                  No internships posted yet
                </h3>

                <p>
                  Create your first opportunity to
                  start receiving student applications.
                </p>

                <button
                  onClick={() =>
                    navigate(
                      "/industry/internships"
                    )
                  }
                >
                  Create internship
                </button>
              </div>
            ) : (
              <div className="industry-internship-list">
                {internships.map((internship) => {
                  const count =
                    applications.filter(
                      (application) =>
                        application.internship?._id ===
                          internship._id ||
                        application.internshipInfo
                          ?._id === internship._id
                    ).length;

                  const shortlistedCount =
                    applications.filter(
                      (application) =>
                        (
                          application.internship?._id ===
                            internship._id ||
                          application.internshipInfo
                            ?._id === internship._id
                        ) &&
                        application.status ===
                          "shortlisted"
                    ).length;

                  return (
                    <div
                      className="industry-internship-row"
                      key={internship._id}
                    >
                      <div className="industry-internship-mark">
                        {internship.companyName
                          ?.charAt(0)
                          .toUpperCase() || "I"}
                      </div>

                      <div className="industry-internship-info">
                        <strong>
                          {internship.title}
                        </strong>

                        <span>
                          {internship.location ||
                            "Remote"}
                          {" · "}
                          {internship.duration}
                        </span>

                        <small>
                          {internship.requiredSkills
                            ?.length || 0}{" "}
                          required skills
                        </small>
                      </div>

                      <div className="industry-internship-metrics">
                        <strong>{count}</strong>
                        <span>applicants</span>
                      </div>

                      <div className="industry-internship-metrics">
                        <strong>
                          {shortlistedCount}
                        </strong>
                        <span>shortlisted</span>
                      </div>

                      <div
                        className={`industry-posting-status ${
                          internship.status
                        }`}
                      >
                        {internship.status}
                      </div>

                      <button
                        className="industry-row-arrow"
                        onClick={() =>
                          navigate(
                            "/industry/candidates"
                          )
                        }
                        title="View candidates"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="industry-dashboard-card">
            <div className="industry-card-heading">
              <div>
                <span>RECENT ACTIVITY</span>
                <h2>Recent candidates</h2>
              </div>

              <button
                onClick={() =>
                  navigate(
                    "/industry/candidates"
                  )
                }
              >
                View all
                <ArrowRight size={15} />
              </button>
            </div>

            {recentApplications.length === 0 ? (
              <div className="industry-empty-state compact">
                <FileText size={23} />

                <p>
                  No student applications have
                  arrived yet.
                </p>
              </div>
            ) : (
              <div className="industry-candidate-list">
                {recentApplications.map(
                  (application) => (
                    <div
                      className="industry-candidate-row"
                      key={application._id}
                    >
                      <div className="industry-candidate-avatar">
                        {application.student?.name
                          ?.charAt(0)
                          .toUpperCase() || "S"}
                      </div>

                      <div className="industry-candidate-info">
                        <strong>
                          {application.student
                            ?.name ||
                            "Student"}
                        </strong>

                        <span>
                          {application.internship
                            ?.title ||
                            application
                              .internshipInfo
                              ?.title ||
                            "Internship"}
                        </span>

                        <small>
                          Applied{" "}
                          {formatDate(
                            application.appliedAt ||
                              application.createdAt
                          )}
                        </small>
                      </div>

                      <div className="industry-candidate-match">
                        <strong>
                          {application.matchPercentage ??
                            0}
                          %
                        </strong>
                        <span>match</span>
                      </div>

                      <div
                        className={`industry-application-status ${application.status}`}
                      >
                        {getStatusIcon(
                          application.status
                        )}
                        {application.status}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </main>

          <aside className="industry-dashboard-side">

  <section className="industry-dashboard-card">
    <div className="industry-card-heading">
      <div>
        <span>INDUSTRY INTELLIGENCE</span>
        <h2>Skill demand</h2>
      </div>
    </div>

    <div className="industry-demand-summary">
      <div>
        <strong>
          {demand?.summary?.openInternships || 0}
        </strong>
        <span>Open internships</span>
      </div>

      <div>
        <strong>
          {demand?.summary?.openJobs || 0}
        </strong>
        <span>Open jobs</span>
      </div>
    </div>

    {demand?.skills?.length ? (
      <div className="industry-demand-list">
        {demand.skills.slice(0, 6).map((item) => (
          <div
            className="industry-demand-row"
            key={item.skill}
          >
            <div>
              <strong>{item.skill}</strong>

              <span>
                {item.internships} internships ·{" "}
                {item.jobs} jobs
              </span>
            </div>

            <strong>{item.demand}</strong>
          </div>
        ))}
      </div>
    ) : (
      <div className="industry-empty-state compact">
        <p>
          No industry skill demand data available yet.
        </p>
      </div>
    )}
  </section>
          <section className="industry-dashboard-card">
            <div className="industry-card-heading">
              <div>
                <span>APPLICATION PIPELINE</span>
                <h2>Candidate status</h2>
              </div>
            </div>

            <div className="industry-pipeline">
              <div>
                <span>
                  <Clock3 size={15} />
                  Pending
                </span>

                <strong>{pending.length}</strong>
              </div>

              <div>
                <span>
                  <UserCheck size={15} />
                  Shortlisted
                </span>

                <strong>
                  {shortlisted.length}
                </strong>
              </div>

              <div>
                <span>
                  <CheckCircle2 size={15} />
                  Accepted
                </span>

                <strong>{accepted.length}</strong>
              </div>
            </div>

            <button
              className="industry-secondary-button"
              onClick={() =>
                navigate(
                  "/industry/candidates"
                )
              }
            >
              Manage candidates
              <ArrowRight size={15} />
            </button>
          </section>

          <section className="industry-dashboard-card">
            <div className="industry-card-heading">
              <div>
                <span>WORKSPACE</span>
                <h2>Quick actions</h2>
              </div>
            </div>

            <div className="industry-quick-actions">
              <button
                onClick={() =>
                  navigate(
                    "/industry/internships"
                  )
                }
              >
                <Plus size={17} />
                <span>
                  <strong>Post internship</strong>
                  <small>
                    Create a new opportunity
                  </small>
                </span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() =>
                  navigate(
                    "/industry/candidates"
                  )
                }
              >
                <Users size={17} />
                <span>
                  <strong>Review candidates</strong>
                  <small>
                    Check applications and matches
                  </small>
                </span>
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </aside>
      </section>

      <button
        className="industry-refresh-button"
        onClick={loadDashboard}
        disabled={loading}
      >
        <RefreshCw
          size={14}
          className={
            loading
              ? "industry-refresh-spin"
              : ""
          }
        />
        Refresh data
      </button>

      {closedInternships.length > 0 && (
        <p className="industry-closed-note">
          {closedInternships.length} closed{" "}
          {closedInternships.length === 1
            ? "posting"
            : "postings"}{" "}
          are included in your workspace.
        </p>
      )}
    </div>
  );
}

export default IndustryDashboard;
