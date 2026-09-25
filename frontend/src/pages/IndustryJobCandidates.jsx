import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  UserRound,
  XCircle,
} from "lucide-react";
import {
  getMyJobs,
  getJobApplications,
  updateJobApplicationStatus,
  updatePlacementDetails,
} from "../services/jobApi";

import "./IndustryJobCandidates.css";

const recruitmentStages = [
  "pending",
  "shortlisted",
  "assessment",
  "interview",
  "selected",
  "offer",
  "joined",
];

const nextActions = {
  pending: {
    status: "shortlisted",
    label: "Shortlist",
  },

  shortlisted: {
    status: "assessment",
    label: "Move to Assessment",
  },

  accepted: {
    status: "assessment",
    label: "Move to Assessment",
  },

  assessment: {
    status: "interview",
    label: "Move to Interview",
  },

  interview: {
    status: "selected",
    label: "Select Candidate",
  },

  selected: {
    status: "offer",
    label: "Move to Offer",
  },

  offer: {
    status: "joined",
    label: "Mark Joined",
  },
};

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
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const IndustryJobCandidates = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] =
    useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [placementId, setPlacementId] = useState("");

  const [placementForm, setPlacementForm] = useState({
    companyName: "",
    role: "",
    package: "",
    offerDate: "",
    joiningDate: "",
    offerUrl: "",
    notes: "",
  });

  const loadApplications = async (jobId) => {
    if (!jobId) return;

    try {
      setApplicationsLoading(true);
      setError("");

      const response = await getJobApplications(jobId);

      setApplications(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load applications"
      );

      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyJobs();

      const jobList = response.data || [];

      setJobs(jobList);

      if (jobList.length > 0) {
        setSelectedJob(jobList[0]._id);
        await loadApplications(jobList[0]._id);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load jobs"
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

  const handleJobChange = async (event) => {
    const jobId = event.target.value;

    setSelectedJob(jobId);

    await loadApplications(jobId);
  };

  const handleStatusChange = async (
    applicationId,
    status
  ) => {
    try {
      setUpdatingId(applicationId);
      setError("");

      await updateJobApplicationStatus(
        applicationId,
        status
      );

      await loadApplications(selectedJob);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update application"
      );
    } finally {
      setUpdatingId("");
    }
  };

  const selectedJobData = jobs.find(
    (job) => job._id === selectedJob
  );

  const openPlacementForm = (application) => {
    setPlacementId(application._id);

    setPlacementForm({
      companyName:
        application.placement?.companyName ||
        selectedJobData?.companyName ||
        "",
      role:
        application.placement?.role ||
        application.job?.title ||
        "",
      package:
        application.placement?.package || "",
      offerDate:
        application.placement?.offerDate
          ? application.placement.offerDate.slice(0, 10)
          : "",
      joiningDate:
        application.placement?.joiningDate
          ? application.placement.joiningDate.slice(0, 10)
          : "",
      offerUrl:
        application.placement?.offerUrl || "",
      notes:
        application.placement?.notes || "",
    });
  };

  const handlePlacementChange = (event) => {
    const { name, value } = event.target;

    setPlacementForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePlacementSave = async (applicationId) => {
    try {
      setUpdatingId(applicationId);
      setError("");

      await updatePlacementDetails(
        applicationId,
        placementForm
      );

      setPlacementId("");

      await loadApplications(selectedJob);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save placement details"
      );
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return (
      <div className="industry-job-candidates-page">
        <div className="industry-job-candidates-card">
          Loading jobs...
        </div>
      </div>
    );
  }

  return (
    <div className="industry-job-candidates-page">
      <div className="industry-job-candidates-header">
        <div>
          <span className="industry-section-label">
            RECRUITMENT
          </span>

          <h1>Job Candidates</h1>

          <p>
            Review applicants and manage your job
            recruitment pipeline.
          </p>
        </div>

        <div className="industry-job-selector">
          <label>Select Job</label>

          <select
            value={selectedJob}
            onChange={handleJobChange}
          >
            {jobs.length === 0 && (
              <option value="">
                No jobs available
              </option>
            )}

            {jobs.map((job) => (
              <option
                key={job._id}
                value={job._id}
              >
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="industry-job-error">
          {error}
        </div>
      )}

      {selectedJobData && (
        <div className="industry-selected-job">
          <div>
            <h2>{selectedJobData.title}</h2>

            <p>
              {selectedJobData.companyName} ·{" "}
              {selectedJobData.location}
            </p>
          </div>

          <div className="industry-job-stats">
            <span>
              {applications.length} Applicants
            </span>

            <span>
              {selectedJobData.openings} Openings
            </span>
          </div>
        </div>
      )}

      <div className="industry-job-candidates-card">
        {applicationsLoading ? (
          <div className="industry-empty-state">
            Loading applicants...
          </div>
        ) : applications.length === 0 ? (
          <div className="industry-empty-state">
            <h3>No applicants yet</h3>

            <p>
              Applications for this job will appear
              here.
            </p>
          </div>
        ) : (
          <div className="industry-candidates-list">
            {applications.map((application) => {
              const currentStageIndex =
                getStageIndex(application.status);

              const action =
                nextActions[application.status];

              const isRejected =
                application.status === "rejected";

              const isJoined =
                application.status === "joined";

              const updating =
                updatingId === application._id;

              return (
                <div
                  className="industry-candidate-row"
                  key={application._id}
                >
                  <div className="candidate-main">
                    <div className="candidate-avatar">
                      {application.student?.name
                        ?.charAt(0)
                        ?.toUpperCase() || (
                        <UserRound size={18} />
                      )}
                    </div>

                    <div>
                      <h3>
                        {application.student?.name ||
                          "Student"}
                      </h3>

                      <p>
                        {application.student?.email ||
                          "No email"}
                      </p>

                      <small>
                        Applied{" "}
                        {application.appliedAt
                          ? new Date(
                              application.appliedAt
                            ).toLocaleDateString()
                          : "-"}
                      </small>
                    </div>
                  </div>

                  <div className="candidate-match">
                    <strong>
                      {application.matchPercentage}%
                    </strong>

                    <span>Skill Match</span>
                  </div>

                  <div className="candidate-message">
                    <span>Cover Message</span>

                    <p>
                      {application.coverMessage ||
                        "No cover message provided."}
                    </p>
                  </div>

                  <div className="job-recruitment-progress">
                    {recruitmentStages.map(
                      (stage, index) => {
                        const completed =
                          currentStageIndex >= index;

                        return (
                          <div
                            className={`recruitment-stage ${
                              completed
                                ? "completed"
                                : ""
                            }`}
                            key={stage}
                          >
                            <span>
                              {completed ? (
                                <CheckCircle2
                                  size={14}
                                />
                              ) : (
                                index + 1
                              )}
                            </span>

                            <small>
                              {formatStatus(stage)}
                            </small>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <div className="candidate-status">
                    <span>Current Status</span>

                    <strong
                      className={`candidate-status-badge status-${application.status}`}
                    >
                      {formatStatus(
                        application.status
                      )}
                    </strong>

                    <div className="candidate-actions">
                      {action &&
                        !isRejected &&
                        !isJoined && (
                          <button
                            className="candidate-primary-action"
                            disabled={updating}
                            onClick={() =>
                              handleStatusChange(
                                application._id,
                                action.status
                              )
                            }
                          >
                            {updating
                              ? "Updating..."
                              : action.label}

                            <ChevronRight
                              size={15}
                            />
                          </button>
                        )}

                      {!isRejected &&
                        !isJoined && (
                          <button
                            className="candidate-reject-action"
                            disabled={updating}
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

                      {isJoined && (
                        <div className="candidate-placement-section">
                          <div className="candidate-final-state">
                            <CheckCircle2 size={16} />
                            Candidate Joined
                          </div>

                          {placementId !==
                            application._id && (
                            <button
                              className="candidate-primary-action"
                              onClick={() =>
                                openPlacementForm(
                                  application
                                )
                              }
                            >
                              {application.placement
                                ?.companyName
                                ? "Edit Placement"
                                : "Add Placement Details"}
                            </button>
                          )}

                          {placementId ===
                            application._id && (
                            <div className="placement-form">
                              <input
                                name="companyName"
                                placeholder="Company name"
                                value={
                                  placementForm.companyName
                                }
                                onChange={
                                  handlePlacementChange
                                }
                              />

                              <input
                                name="role"
                                placeholder="Job role"
                                value={
                                  placementForm.role
                                }
                                onChange={
                                  handlePlacementChange
                                }
                              />

                              <input
                                name="package"
                                placeholder="Package / CTC"
                                value={
                                  placementForm.package
                                }
                                onChange={
                                  handlePlacementChange
                                }
                              />

                              <label>
                                Offer Date

                                <input
                                  type="date"
                                  name="offerDate"
                                  value={
                                    placementForm.offerDate
                                  }
                                  onChange={
                                    handlePlacementChange
                                  }
                                />
                              </label>

                              <label>
                                Joining Date

                                <input
                                  type="date"
                                  name="joiningDate"
                                  value={
                                    placementForm.joiningDate
                                  }
                                  onChange={
                                    handlePlacementChange
                                  }
                                />
                              </label>

                              <input
                                name="offerUrl"
                                placeholder="Offer letter URL"
                                value={
                                  placementForm.offerUrl
                                }
                                onChange={
                                  handlePlacementChange
                                }
                              />

                              <textarea
                                name="notes"
                                placeholder="Placement notes"
                                value={
                                  placementForm.notes
                                }
                                onChange={
                                  handlePlacementChange
                                }
                                rows={3}
                              />

                              <div className="placement-form-actions">
                                <button
                                  className="candidate-primary-action"
                                  disabled={
                                    updatingId ===
                                    application._id
                                  }
                                  onClick={() =>
                                    handlePlacementSave(
                                      application._id
                                    )
                                  }
                                >
                                  {updatingId ===
                                  application._id
                                    ? "Saving..."
                                    : "Save Placement"}
                                </button>

                                <button
                                  className="candidate-reject-action"
                                  onClick={() =>
                                    setPlacementId("")
                                  }
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {isRejected && (
                        <div className="candidate-final-state rejected">
                          <XCircle size={16} />
                          Application Rejected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndustryJobCandidates;
