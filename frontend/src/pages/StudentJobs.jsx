import { useEffect, useState, useCallback } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Send,
  X,
} from "lucide-react";

import {
  applyForJob,
  getJobMatch,
  getJobs,
  getMyJobApplications,
} from "../services/jobApi";

import "./StudentJobs.css";

const recruitmentStages = [
  "pending",
  "shortlisted",
  "assessment",
  "interview",
  "selected",
  "offer",
  "joined",
];

const getStageIndex = (status) => {
  if (status === "accepted") {
    return 2;
  }

  return recruitmentStages.indexOf(status);
};

const formatStatus = (status) => {
  if (!status) return "Pending";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [matches, setMatches] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverMessage, setCoverMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [jobsResponse, applicationsResponse] = await Promise.all([
        getJobs(),
        getMyJobApplications(),
      ]);

      const jobList = jobsResponse?.data || [];
      const applicationList = applicationsResponse?.data || [];

      setJobs(jobList);
      setApplications(applicationList);

      const matchResults = {};

      await Promise.all(
        jobList.map(async (job) => {
          try {
            const response = await getJobMatch(job._id);
            matchResults[job._id] = response?.data;
          } catch {
            matchResults[job._id] = null;
          }
        })
      );

      setMatches(matchResults);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to load available jobs."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadJobs();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadJobs]);

  const hasApplied = (jobId) =>
    applications.some(
      (application) =>
        application.job?._id === jobId || application.job === jobId
    );

  const getApplicationForJob = (jobId) =>
    applications.find(
      (application) =>
        application.job?._id === jobId || application.job === jobId
    );

  const openApply = (job) => {
    setSelectedJob(job);
    setCoverMessage("");
    setMessage("");
    setError("");
  };

  const closeApply = () => {
    if (applying) return;

    setSelectedJob(null);
    setCoverMessage("");
  };

  const handleApply = async () => {
    if (!selectedJob) return;

    try {
      setApplying(true);
      setError("");
      setMessage("");

      await applyForJob(selectedJob._id, coverMessage);

      setMessage("Application submitted successfully.");

      setSelectedJob(null);
      setCoverMessage("");

      await loadJobs();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Failed to submit application."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <section className="student-jobs-page">
        <div className="student-jobs-loading">
          Loading available jobs...
        </div>
      </section>
    );
  }

  return (
    <section className="student-jobs-page">
      <header className="student-jobs-header">
        <div>
          <span className="student-jobs-eyebrow">
            CAREER OPPORTUNITIES
          </span>

          <h1>Find your next opportunity</h1>

          <p>
            Explore industry jobs matched against your current skills and apply
            directly through Open Collab.
          </p>
        </div>

        <div className="student-jobs-count">
          <BriefcaseBusiness size={18} />

          <span>{jobs.length} open jobs</span>
        </div>
      </header>

      {message && (
        <div className="student-jobs-message success">
          <CheckCircle2 size={17} />
          {message}
        </div>
      )}

      {error && (
        <div className="student-jobs-message error">{error}</div>
      )}

      {jobs.length === 0 ? (
        <div className="student-jobs-empty">
          <BriefcaseBusiness size={42} />

          <h2>No open jobs right now</h2>

          <p>
            New opportunities will appear here when industries publish job
            openings.
          </p>
        </div>
      ) : (
        <div className="student-jobs-grid">
          {jobs.map((job) => {
            const match = matches[job._id];
            const applied = hasApplied(job._id);
            const application = getApplicationForJob(job._id);

            const stageIndex = application
              ? getStageIndex(application.status)
              : -1;

            return (
              <article className="student-job-card" key={job._id}>
                <div className="student-job-card-top">
                  <div className="student-company-icon">
                    <Building2 size={20} />
                  </div>

                  <div className="student-job-title">
                    <h2>{job.title}</h2>

                    <p>{job.companyName}</p>
                  </div>

                  {match && (
                    <div
                      className={`job-match-badge ${
                        match.percentage >= 70
                          ? "high"
                          : match.percentage >= 40
                          ? "medium"
                          : "low"
                      }`}
                    >
                      {match.percentage}% match
                    </div>
                  )}
                </div>

                <p className="student-job-description">
                  {job.description}
                </p>

                <div className="student-job-meta">
                  <span>
                    <MapPin size={14} />
                    {job.location || "Remote"}
                  </span>

                  <span>
                    <BriefcaseBusiness size={14} />
                    {job.type}
                  </span>

                  <span>
                    <CalendarDays size={14} />
                    Deadline{" "}
                    {new Date(
                      job.applicationDeadline
                    ).toLocaleDateString()}
                  </span>
                </div>

                <div className="student-job-details">
                  <strong>{job.salary}</strong>

                  <span>{job.experience}</span>

                  <span>
                    {job.openings}{" "}
                    {job.openings === 1 ? "opening" : "openings"}
                  </span>
                </div>

                <div className="student-required-skills">
                  {(job.requiredSkills || []).map((skill) => (
                    <span key={`${job._id}-${skill.name}`}>
                      {skill.name} · {skill.minimumLevel}
                    </span>
                  ))}
                </div>

                {match?.missingSkills?.length > 0 && (
                  <div className="missing-skills">
                    <span>Skills to improve:</span>

                    <div>
                      {match.missingSkills.map((skill) => (
                        <small
                          key={`${job._id}-missing-${skill.name}`}
                        >
                          {skill.name}
                        </small>
                      ))}
                    </div>
                  </div>
                )}

                {application && (
                  <div className="student-recruitment-box">
                    <div className="student-recruitment-heading">
                      <div>
                        <span>APPLICATION STATUS</span>

                        <strong>
                          {formatStatus(application.status)}
                        </strong>
                      </div>
                    </div>

                    {application.status === "rejected" ? (
                      <div className="student-recruitment-rejected">
                        Your application was not selected for this
                        position.
                      </div>
                    ) : (
                      <div className="student-recruitment-progress">
                        {recruitmentStages.map((stage, index) => {
                          const completed = stageIndex >= index;

                          return (
                            <div
                              className={`student-recruitment-stage ${
                                completed ? "completed" : ""
                              }`}
                              key={stage}
                            >
                              <div>
                                {completed ? (
                                  <CheckCircle2 size={14} />
                                ) : (
                                  index + 1
                                )}
                              </div>

                              <span>{formatStatus(stage)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {application.status === "joined" && (
                      <div className="student-placement-note">
                        <CheckCircle2 size={15} />
                        You have joined this organization.
                      </div>
                    )}
                  </div>
                )}

                <div className="student-job-actions">
                  {applied ? (
                    <button
                      className="student-applied-button"
                      disabled
                    >
                      <CheckCircle2 size={16} />
                      Application Submitted
                    </button>
                  ) : (
                    <button
                      className="student-apply-button"
                      onClick={() => openApply(job)}
                    >
                      <Send size={16} />
                      Apply Now
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedJob && (
        <div
          className="job-apply-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeApply();
            }
          }}
        >
          <div className="job-apply-modal">
            <div className="job-apply-modal-header">
              <div>
                <span>APPLICATION</span>

                <h2>{selectedJob.title}</h2>

                <p>{selectedJob.companyName}</p>
              </div>

              <button
                className="job-modal-close"
                onClick={closeApply}
                disabled={applying}
              >
                <X size={19} />
              </button>
            </div>

            <label>
              Cover message
              <textarea
                value={coverMessage}
                onChange={(event) =>
                  setCoverMessage(event.target.value)
                }
                placeholder="Tell the company briefly why you're a good fit..."
                rows={6}
                maxLength={2000}
              />
            </label>

            <div className="job-apply-modal-actions">
              <button
                className="secondary-button"
                onClick={closeApply}
                disabled={applying}
              >
                Cancel
              </button>

              <button
                className="student-apply-button"
                onClick={handleApply}
                disabled={applying}
              >
                <Send size={16} />

                {applying ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default StudentJobs;
