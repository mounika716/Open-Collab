import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Users,
  UserRoundCheck,
  XCircle,
  Building2,
  FileText,
  BarChart3,
Target,
GraduationCap,
} from "lucide-react";
import { getAdminDashboard } from "../services/adminApi";
import "./AdminDashboard.css";

function formatDate(value) {
  if (!value) return "â€”";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function roleLabel(role) {
  if (role === "student") return "Student";
  if (role === "industry") return "Industry";
  if (role === "admin") return "Admin";

  return role || "User";
}

function statusLabel(status) {
  if (status === "shortlisted") return "Shortlisted";
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Rejected";

  return "Pending";
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getAdminDashboard();

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to load dashboard"
        );
      }

      setDashboard(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load admin dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboard();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const applications = dashboard?.internshipApplications || {};
  const jobApplications = dashboard?.jobApplications || {};

  const applicationTotal = applications.total || 0;
  const jobApplicationTotal = jobApplications.total || 0;

  const applicationRate = useMemo(() => {
    if (!applicationTotal) return 0;

    return Math.round(
      ((applications.accepted || 0) / applicationTotal) * 100
    );
  }, [applications, applicationTotal]);

  const jobApplicationRate = useMemo(() => {
    if (!jobApplicationTotal) return 0;

    return Math.round(
      ((jobApplications.accepted || 0) / jobApplicationTotal) * 100
    );
  }, [jobApplications, jobApplicationTotal]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <XCircle size={22} />

          <div>
            <h3>Dashboard unavailable</h3>
            <p>{error}</p>
          </div>

          <button onClick={() => loadDashboard()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const users = dashboard?.users || {};
  const internships = dashboard?.internships || {};
  const jobs = dashboard?.jobs || {};
    const assessments = dashboard?.assessments || {};
    const studentSkills = dashboard?.studentSkills || {};
    const industryDemand = dashboard?.industryDemand || {};
    const placement = dashboard?.placement || {};
  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <span className="admin-eyebrow">
            <ShieldCheck size={15} />
            Platform Administration
          </span>

          <h1>Admin Dashboard</h1>

          <p>
            Monitor users, internships, jobs, applications and
            recruitment activity from one place.
          </p>
        </div>

        <button
          className="admin-refresh"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "admin-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Platform statistics */}

      <section className="admin-stat-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Total Users</span>

            <strong>{users.total || 0}</strong>

            <small>
              {users.students || 0} students Â·{" "}
              {users.industries || 0} industries
            </small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <BriefcaseBusiness size={21} />
          </div>

          <div>
            <span>Internships</span>

            <strong>{internships.total || 0}</strong>

            <small>
              {internships.open || 0} currently open
            </small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Building2 size={21} />
          </div>

          <div>
            <span>Jobs</span>

            <strong>{jobs.total || 0}</strong>

            <small>
              {jobs.open || 0} currently open
            </small>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Activity size={21} />
          </div>

          <div>
            <span>Applications</span>

            <strong>
              {applicationTotal + jobApplicationTotal}
            </strong>

            <small>
              {applicationTotal} internships Â·{" "}
              {jobApplicationTotal} jobs
            </small>
          </div>
        </div>
      </section>

      {/* Internship + Job recruitment overview */}

      <section className="admin-main-grid">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Internship Pipeline</h2>
              <p>Current internship recruitment activity</p>
            </div>
          </div>

          <div className="pipeline-list">
            <div className="pipeline-item">
              <span className="pipeline-label">
                <Clock3 size={16} />
                Pending
              </span>

              <strong>{applications.pending || 0}</strong>
            </div>

            <div className="pipeline-item">
              <span className="pipeline-label">
                <UserRoundCheck size={16} />
                Shortlisted
              </span>

              <strong>
                {applications.shortlisted || 0}
              </strong>
            </div>

            <div className="pipeline-item">
              <span className="pipeline-label">
                <CheckCircle2 size={16} />
                Accepted
              </span>

              <strong>{applications.accepted || 0}</strong>
            </div>

            <div className="pipeline-item">
              <span className="pipeline-label">
                <XCircle size={16} />
                Rejected
              </span>

              <strong>{applications.rejected || 0}</strong>
            </div>

            <div className="pipeline-total">
              <span>Acceptance rate</span>
              <strong>{applicationRate}%</strong>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Job Recruitment Pipeline</h2>
              <p>Current job recruitment activity</p>
            </div>
          </div>

          <div className="pipeline-list">
            <div className="pipeline-item">
              <span className="pipeline-label">
                <Clock3 size={16} />
                Pending
              </span>

              <strong>{jobApplications.pending || 0}</strong>
            </div>

            <div className="pipeline-item">
              <span className="pipeline-label">
                <UserRoundCheck size={16} />
                Shortlisted
              </span>

              <strong>
                {jobApplications.shortlisted || 0}
              </strong>
            </div>

            <div className="pipeline-item">
              <span className="pipeline-label">
                <CheckCircle2 size={16} />
                Accepted
              </span>

              <strong>
                {jobApplications.accepted || 0}
              </strong>
            </div>

            <div className="pipeline-item">
              <span className="pipeline-label">
                <XCircle size={16} />
                Rejected
              </span>

              <strong>
                {jobApplications.rejected || 0}
              </strong>
            </div>

            <div className="pipeline-total">
              <span>Acceptance rate</span>
              <strong>{jobApplicationRate}%</strong>
            </div>
          </div>
        </div>
      </section>

      {/* User distribution */}

      <section className="admin-content-grid">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>User Distribution</h2>
              <p>Registered platform accounts</p>
            </div>
          </div>

          <div className="user-distribution">
            <div className="distribution-row">
              <span>Students</span>
              <strong>{users.students || 0}</strong>
            </div>

            <div className="distribution-row">
              <span>Industries</span>
              <strong>{users.industries || 0}</strong>
            </div>

            <div className="distribution-row">
              <span>Admins</span>
              <strong>{users.admins || 0}</strong>
            </div>

            <div className="distribution-total">
              <span>Total registered users</span>
              <strong>{users.total || 0}</strong>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Recruitment Summary</h2>
              <p>Internship and job applications</p>
            </div>
          </div>

          <div className="user-distribution">
            <div className="distribution-row">
              <span>Internship applications</span>
              <strong>{applicationTotal}</strong>
            </div>

            <div className="distribution-row">
              <span>Job applications</span>
              <strong>{jobApplicationTotal}</strong>
            </div>

            <div className="distribution-row">
              <span>Internship accepted</span>
              <strong>{applications.accepted || 0}</strong>
            </div>

            <div className="distribution-row">
              <span>Jobs accepted</span>
              <strong>{jobApplications.accepted || 0}</strong>
            </div>

            <div className="distribution-total">
              <span>Total recruitment applications</span>

              <strong>
                {applicationTotal + jobApplicationTotal}
              </strong>
            </div>
          </div>
        </div>
      </section>
      <section className="admin-content-grid">
  <div className="admin-panel">
    <div className="admin-panel-header">
      <div>
        <h2>Assessment Intelligence</h2>
        <p>Student assessment performance</p>
      </div>

      <GraduationCap size={19} />
    </div>

    <div className="user-distribution">
      <div className="distribution-row">
        <span>Completed assessments</span>
        <strong>{assessments.completed || 0}</strong>
      </div>

      <div className="distribution-row">
        <span>Average score</span>
        <strong>{assessments.averageScore || 0}%</strong>
      </div>

      <div className="distribution-row">
        <span>Tracked student skills</span>
        <strong>
          {studentSkills.totalTrackedSkills || 0}
        </strong>
      </div>
    </div>
  </div>

  <div className="admin-panel">
    <div className="admin-panel-header">
      <div>
        <h2>Placement Outcomes</h2>
        <p>Current recruitment outcomes</p>
      </div>

      <Target size={19} />
    </div>

    <div className="user-distribution">
      <div className="distribution-row">
        <span>Selected</span>
        <strong>{placement.selected || 0}</strong>
      </div>

      <div className="distribution-row">
        <span>Offers</span>
        <strong>{placement.offers || 0}</strong>
      </div>

      <div className="distribution-row">
        <span>Joined</span>
        <strong>{placement.joined || 0}</strong>
      </div>

      <div className="distribution-total">
        <span>Completed internships</span>
        <strong>
          {placement.completedInternships || 0}
        </strong>
      </div>
    </div>
  </div>
</section>

<section className="admin-panel">
  <div className="admin-panel-header">
    <div>
      <h2>Industry Skill Demand</h2>
      <p>
        Skills currently requested across open internships and jobs
      </p>
    </div>

    <BarChart3 size={19} />
  </div>

  {industryDemand.skills?.length ? (
    <div className="admin-demand-list">
      {industryDemand.skills.map((item) => (
        <div
          className="admin-demand-row"
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
    <div className="admin-empty">
      No industry skill demand data available yet.
    </div>
  )}
</section>

      {/* Recent users + internship activity */}

      <section className="admin-content-grid">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Recent Users</h2>
              <p>Latest platform registrations</p>
            </div>
          </div>

          <div className="admin-table-wrap">
            {dashboard?.recentUsers?.length ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.recentUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="table-user">
                          <div className="table-avatar">
                            {(user.name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {user.name || "Unnamed User"}
                            </strong>

                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`role-badge role-${user.role}`}
                        >
                          {roleLabel(user.role)}
                        </span>
                      </td>

                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty">
                No users found.
              </div>
            )}
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Recent Internship Activity</h2>
              <p>Latest internship applications</p>
            </div>
          </div>

          <div className="activity-list">
            {dashboard?.recentInternshipApplications?.length ? (
              dashboard.recentInternshipApplications.map(
                (application) => (
                  <div
                    className="activity-item"
                    key={application._id}
                  >
                    <div className="activity-icon">
                      <Activity size={16} />
                    </div>

                    <div className="activity-content">
                      <strong>
                        {application.student?.name ||
                          "Student"}
                      </strong>

                      <p>
                        applied for{" "}
                        {application.internship?.title ||
                          "an internship"}
                      </p>

                      <span>
                        {application.internship?.companyName ||
                          "Industry"}{" "}
                        Â·{" "}
                        {formatDate(application.appliedAt)}
                      </span>
                    </div>

                    <span
                      className={`status-badge status-${application.status}`}
                    >
                      {statusLabel(application.status)}
                    </span>
                  </div>
                )
              )
            ) : (
              <div className="admin-empty">
                No internship activity yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent job activity */}

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Recent Job Applications</h2>
            <p>Latest industry recruitment activity</p>
          </div>
        </div>

        <div className="activity-list">
          {dashboard?.recentJobApplications?.length ? (
            dashboard.recentJobApplications.map(
              (application) => (
                <div
                  className="activity-item"
                  key={application._id}
                >
                  <div className="activity-icon">
                    <FileText size={16} />
                  </div>

                  <div className="activity-content">
                    <strong>
                      {application.student?.name ||
                        "Student"}
                    </strong>

                    <p>
                      applied for{" "}
                      {application.job?.title ||
                        "a job"}
                    </p>

                    <span>
                      {application.job?.companyName ||
                        "Industry"}{" "}
                      Â· Match{" "}
                      {application.matchPercentage || 0}%{" "}
                      Â·{" "}
                      {formatDate(application.appliedAt)}
                    </span>
                  </div>

                  <span
                    className={`status-badge status-${application.status}`}
                  >
                    {statusLabel(application.status)}
                  </span>
                </div>
              )
            )
          ) : (
            <div className="admin-empty">
              No job application activity yet.
            </div>
          )}
        </div>
      </section>

      {/* Recent internships */}

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Recent Internship Postings</h2>
            <p>Latest opportunities added by industry</p>
          </div>
        </div>

        <div className="admin-internship-grid">
          {dashboard?.recentInternships?.length ? (
            dashboard.recentInternships.map(
              (internship) => (
                <div
                  className="admin-internship-card"
                  key={internship._id}
                >
                  <div className="internship-card-top">
                    <div className="internship-icon">
                      <BriefcaseBusiness size={18} />
                    </div>

                    <span
                      className={
                        internship.status === "open"
                          ? "open-badge"
                          : "closed-badge"
                      }
                    >
                      {internship.status === "open"
                        ? "Open"
                        : "Closed"}
                    </span>
                  </div>

                  <h3>{internship.title}</h3>

                  <p>{internship.companyName}</p>

                  <div className="internship-meta">
                    <span>
                      {internship.location || "Remote"}
                    </span>

                    <span>
                      {internship.type || "Remote"}
                    </span>

                    <span>
                      {internship.openings || 1} openings
                    </span>
                  </div>

                  <div className="internship-footer">
                    <span>
                      Deadline:{" "}
                      {formatDate(
                        internship.applicationDeadline
                      )}
                    </span>
                  </div>
                </div>
              )
            )
          ) : (
            <div className="admin-empty">
              No internships have been posted yet.
            </div>
          )}
        </div>
      </section>

      {/* Recent jobs */}

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <h2>Recent Job Postings</h2>
            <p>Latest employment opportunities added by industry</p>
          </div>
        </div>

        <div className="admin-internship-grid">
          {dashboard?.recentJobs?.length ? (
            dashboard.recentJobs.map((job) => (
              <div
                className="admin-internship-card"
                key={job._id}
              >
                <div className="internship-card-top">
                  <div className="internship-icon">
                    <BriefcaseBusiness size={18} />
                  </div>

                  <span
                    className={
                      job.status === "open"
                        ? "open-badge"
                        : "closed-badge"
                    }
                  >
                    {job.status === "open"
                      ? "Open"
                      : "Closed"}
                  </span>
                </div>

                <h3>{job.title}</h3>

                <p>{job.companyName}</p>

                <div className="internship-meta">
                  <span>
                    {job.location || "Remote"}
                  </span>

                  <span>
                    {job.type || "Remote"}
                  </span>

                  <span>
                    {job.openings || 1} openings
                  </span>
                </div>

                <div className="internship-footer">
                  <span>
                    Deadline:{" "}
                    {formatDate(job.applicationDeadline)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="admin-empty">
              No jobs have been posted yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;


