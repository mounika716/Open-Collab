import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  PlayCircle,
  RefreshCw,
  UserRound,
  XCircle,
} from "lucide-react";

import { getMyInternships } from "../services/industryApi";
import {
  getInternshipApplications,
  updateApplicationStatus,
  evaluateInternship,
  issueInternshipCertificate,
} from "../services/applicationApi";

import "./IndustryCandidates.css";

function IndustryCandidates() {
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] =
    useState("");
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] =
    useState(false);
  const [updatingId, setUpdatingId] = useState(null);

const [evaluatingId, setEvaluatingId] =
  useState(null);

const [certificateId, setCertificateId] =
  useState(null);

const [error, setError] = useState("");

  const loadInternships = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyInternships();
      const items = response.internships || [];

      setInternships(items);

      if (items.length > 0) {
        setSelectedInternship(items[0]._id);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your internships."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (internshipId) => {
    if (!internshipId) {
      setApplications([]);
      return;
    }

    try {
      setApplicationsLoading(true);
      setError("");

      const response =
        await getInternshipApplications(internshipId);

      setApplications(response.applications || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load applications."
      );
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadInternships();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadApplications(selectedInternship);
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedInternship]);

  const handleStatusChange = async (
    applicationId,
    status
  ) => {
    try {
      setUpdatingId(applicationId);
      setError("");

      await updateApplicationStatus(
        applicationId,
        status
      );

      await loadApplications(selectedInternship);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update application."
      );
    } finally {
      setUpdatingId(null);
    }
  };

    const handleEvaluation = async (
    application
  ) => {
    const rating = window.prompt(
      "Enter rating from 1 to 5:"
    );

    if (rating === null) {
      return;
    }

    const numericRating = Number(rating);

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    const feedback = window.prompt(
      "Enter feedback for the student:"
    );

    if (feedback === null) {
      return;
    }

    const skillsInput = window.prompt(
      "Enter skills demonstrated, separated by commas:"
    );

    if (skillsInput === null) {
      return;
    }

    const completionNote = window.prompt(
      "Enter a completion note:"
    );

    if (completionNote === null) {
      return;
    }

    try {
      setEvaluatingId(application._id);
      setError("");

      await evaluateInternship(
        application._id,
        {
          rating: numericRating,
          feedback,
          skillsDemonstrated:
            skillsInput
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          completionNote,
        }
      );

      await loadApplications(
        selectedInternship
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save evaluation."
      );
    } finally {
      setEvaluatingId(null);
    }
  };

  const handleCertificate = async (
    application
  ) => {
    const name = window.prompt(
      "Enter certificate name:"
    );

    if (name === null) {
      return;
    }

    const issuer = window.prompt(
      "Enter certificate issuer:"
    );

    if (issuer === null) {
      return;
    }

    const url = window.prompt(
      "Enter certificate URL (optional):"
    );

    if (url === null) {
      return;
    }

    try {
      setCertificateId(application._id);
      setError("");

      await issueInternshipCertificate(
        application._id,
        {
          name,
          issuer,
          url,
        }
      );

      await loadApplications(
        selectedInternship
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to issue certificate."
      );
    } finally {
      setCertificateId(null);
    }
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

  const canShortlist = (status) =>
    status === "pending";

  const canAccept = (status) =>
    status === "shortlisted";

  const canReject = (status) =>
    ["pending", "shortlisted", "accepted"].includes(
      status
    );

  const canJoin = (status) =>
    status === "accepted";

  const canStart = (status) =>
    status === "joined";

  const canComplete = (status) =>
    status === "in_progress";

  if (loading) {
    return (
      <div className="candidates-state">
        <RefreshCw
          size={19}
          className="candidates-spin"
        />
        Loading candidates...
      </div>
    );
  }

  return (
    <div className="industry-candidates-page">
      <section className="candidates-header">
        <div>
          <span className="industry-eyebrow">
            INDUSTRY WORKSPACE
          </span>

          <h1>Candidate Management</h1>

          <p>
            Review student applications, compare skill
            matches and manage the complete internship
            lifecycle.
          </p>
        </div>

        <div className="candidate-count">
          <strong>{applications.length}</strong>
          <span>Applicants</span>
        </div>
      </section>

      {error && (
        <div className="candidate-error">
          <XCircle size={18} />
          {error}
        </div>
      )}

      {internships.length === 0 ? (
        <section className="candidates-empty">
          <BriefcaseBusiness size={36} />

          <h2>No internship postings</h2>

          <p>
            Create an internship first to start receiving
            student applications.
          </p>
        </section>
      ) : (
        <>
          <section className="candidate-filter-card">
            <label htmlFor="internship-select">
              Select Internship
            </label>

            <select
              id="internship-select"
              value={selectedInternship}
              onChange={(event) =>
                setSelectedInternship(event.target.value)
              }
            >
              {internships.map((internship) => (
                <option
                  key={internship._id}
                  value={internship._id}
                >
                  {internship.title} —{" "}
                  {internship.companyName}
                </option>
              ))}
            </select>
          </section>

          {applicationsLoading ? (
            <div className="candidates-state">
              <RefreshCw
                size={19}
                className="candidates-spin"
              />
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <section className="candidates-empty">
              <UserRound size={36} />

              <h2>No applications yet</h2>

              <p>
                Students who apply to this internship will
                appear here.
              </p>
            </section>
          ) : (
            <section className="candidate-list">
              {applications.map((application) => {
                const student = application.student;
                const status = application.status;
                const isUpdating =
                  updatingId === application._id;

                return (
                  <article
                    className="candidate-card"
                    key={application._id}
                  >
                    <div className="candidate-avatar">
                      {student?.name
                        ?.charAt(0)
                        .toUpperCase() || "S"}
                    </div>

                    <div className="candidate-main">
                      <div className="candidate-top">
                        <div>
                          <span className="candidate-label">
                            STUDENT
                          </span>

                          <h2>
                            {student?.name ||
                              "Student"}
                          </h2>

                          <p>
                            {student?.email ||
                              "No email available"}
                          </p>
                        </div>

                        <span
                          className={`candidate-status ${status}`}
                        >
                          {getStatusIcon(status)}
                          {getStatusLabel(status)}
                        </span>
                      </div>

                      <div className="candidate-meta">
                        <span>
                          Match{" "}
                          <strong>
                            {application.matchPercentage ??
                              0}
                            %
                          </strong>
                        </span>

                        <span>
                          Applied{" "}
                          {new Date(
                            application.appliedAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>

                        {application.acceptedAt && (
                          <span>
                            Accepted{" "}
                            {new Date(
                              application.acceptedAt
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      <div className="internship-lifecycle">
                        <span
                          className={
                            [
                              "pending",
                              "shortlisted",
                              "accepted",
                              "joined",
                              "in_progress",
                              "completed",
                            ].includes(status)
                              ? "active"
                              : ""
                          }
                        >
                          Applied
                        </span>

                        <span
                          className={
                            [
                              "shortlisted",
                              "accepted",
                              "joined",
                              "in_progress",
                              "completed",
                            ].includes(status)
                              ? "active"
                              : ""
                          }
                        >
                          Shortlisted
                        </span>

                        <span
                          className={
                            [
                              "accepted",
                              "joined",
                              "in_progress",
                              "completed",
                            ].includes(status)
                              ? "active"
                              : ""
                          }
                        >
                          Accepted
                        </span>

                        <span
                          className={
                            [
                              "joined",
                              "in_progress",
                              "completed",
                            ].includes(status)
                              ? "active"
                              : ""
                          }
                        >
                          Joined
                        </span>

                        <span
                          className={
                            [
                              "in_progress",
                              "completed",
                            ].includes(status)
                              ? "active"
                              : ""
                          }
                        >
                          In Progress
                        </span>

                        <span
                          className={
                            status === "completed"
                              ? "active"
                              : ""
                          }
                        >
                          Completed
                        </span>
                      </div>

                      {application.coverMessage && (
                        <div className="cover-message">
                          <span>Cover message</span>
                          <p>
                            {application.coverMessage}
                          </p>
                        </div>
                      )}

                      <div className="candidate-actions">
                        {canShortlist(status) && (
                          <button
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(
                                application._id,
                                "shortlisted"
                              )
                            }
                          >
                            <CheckCircle2 size={15} />
                            Shortlist
                          </button>
                        )}

                        {canAccept(status) && (
                          <button
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(
                                application._id,
                                "accepted"
                              )
                            }
                          >
                            <CheckCircle2 size={15} />
                            Accept
                          </button>
                        )}

                        {canJoin(status) && (
                          <button
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(
                                application._id,
                                "joined"
                              )
                            }
                          >
                            <UserRound size={15} />
                            Mark Joined
                          </button>
                        )}

                        {canStart(status) && (
                          <button
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(
                                application._id,
                                "in_progress"
                              )
                            }
                          >
                            <PlayCircle size={15} />
                            Start Internship
                          </button>
                        )}

                        {canComplete(status) && (
                          <button
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(
                                application._id,
                                "completed"
                              )
                            }
                          >
                            <CheckCircle2 size={15} />
                            Complete
                          </button>
                        )}
                       {status === "completed" &&
                              !application.evaluation?.evaluatedAt && (
                                <button
                                  disabled={evaluatingId === application._id}
                                  onClick={() =>
                                    handleEvaluation(application)
                                  }
                                >
                                  <CheckCircle2 size={15} />

                                  {evaluatingId === application._id
                                    ? "Saving..."
                                    : "Evaluate Intern"}
                                </button>
                              )}

                            {status === "completed" &&
                              application.evaluation?.evaluatedAt &&
                              !application.certificate?.issued && (
                                <button
                                  disabled={certificateId === application._id}
                                  onClick={() =>
                                    handleCertificate(application)
                                  }
                                >
                                  <CheckCircle2 size={15} />

                                  {certificateId === application._id
                                    ? "Issuing..."
                                    : "Issue Certificate"}
                                </button>
                              )}

                            {status === "completed" &&
                              application.certificate?.issued && (
                                <span className="certificate-issued">
                                  <CheckCircle2 size={15} />
                                  Certificate Issued
                                </span>
                              )}
                        {canReject(status) && (
                          <button
                            className="reject-button"
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(
                                application._id,
                                "rejected"
                              )
                            }
                          >
                            <XCircle size={15} />
                            Reject
                          </button>
                        )}

                        {isUpdating && (
                          <span className="candidate-updating">
                            Updating...
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default IndustryCandidates;
