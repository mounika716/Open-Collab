import { useEffect, useState } from "react";
import {
  Check,
  X,
  Play,
  CircleCheck,
  RefreshCw,
} from "lucide-react";

import {
  getOpportunityRequests,
  updateCollaborationStatus,
} from "../services/collaborationApi";

import "./CollaborationRequests.css";

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

import { useParams } from "react-router-dom";

export default function CollaborationRequests() {
  const { opportunityId } = useParams();

  const opportunityTitle = "Collaboration Requests";
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getOpportunityRequests(opportunityId);

      setRequests(data.requests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load collaboration requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!opportunityId) return;

    const timer = setTimeout(() => {
      loadRequests();
    }, 0);

    return () => clearTimeout(timer);
  }, [opportunityId]);

  const changeStatus = async (id, status) => {
    try {
      setUpdating(id);
      setError("");

      await updateCollaborationStatus(id, { status });

      await loadRequests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update collaboration"
      );
    } finally {
      setUpdating(null);
    }
  };

  const updateProgress = async (id, progress) => {
    try {
      setUpdating(id);

      await updateCollaborationStatus(id, {
        progress: Number(progress),
      });

      setRequests((current) =>
        current.map((request) =>
          request._id === id
            ? {
                ...request,
                progress: Number(progress),
              }
            : request
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update progress"
      );
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="collaboration-requests-page">
        <div className="requests-loading">
          Loading requests...
        </div>
      </div>
    );
  }

  return (
    <div className="collaboration-requests-page">
      <div className="requests-header">
        <div>
          <span className="requests-eyebrow">
            COLLABORATION MANAGEMENT
          </span>

          <h1>{opportunityTitle}</h1>

          <p>
            Review participants and manage the
            collaboration lifecycle.
          </p>
        </div>

        <button
          className="refresh-requests"
          onClick={loadRequests}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="requests-error">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="empty-requests">
          <h3>No requests yet</h3>

          <p>
            Participants who apply to this opportunity
            will appear here.
          </p>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <article
              className="request-card"
              key={request._id}
            >
              <div className="request-main">
                <div className="applicant-avatar">
                  {(
                    request.applicant?.name || "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="applicant-info">
                  <h2>
                    {request.applicant?.name ||
                      "Unknown applicant"}
                  </h2>

                  <p>
                    {request.applicant?.email}
                  </p>

                  <span className="applicant-role">
                    {request.applicantRole}
                  </span>
                </div>

                <div
                  className={`request-status ${request.status}`}
                >
                  {statusLabels[request.status] ||
                    request.status}
                </div>
              </div>

              {request.message && (
                <div className="request-message">
                  <span>Applicant message</span>

                  <p>{request.message}</p>
                </div>
              )}

              {(request.status === "approved" ||
                request.status === "active" ||
                request.status === "completed") && (
                <div className="request-progress">
                  <div className="progress-header">
                    <span>Progress</span>

                    <strong>
                      {request.progress || 0}%
                    </strong>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={request.progress || 0}
                    disabled={
                      updating === request._id ||
                      request.status === "completed"
                    }
                    onChange={(event) =>
                      updateProgress(
                        request._id,
                        event.target.value
                      )
                    }
                  />
                </div>
              )}

              <div className="request-actions">
                {request.status === "pending" && (
                  <>
                    <button
                      className="action-button approve"
                      disabled={updating === request._id}
                      onClick={() =>
                        changeStatus(
                          request._id,
                          "approved"
                        )
                      }
                    >
                      <Check size={15} />
                      Approve
                    </button>

                    <button
                      className="action-button reject"
                      disabled={updating === request._id}
                      onClick={() =>
                        changeStatus(
                          request._id,
                          "rejected"
                        )
                      }
                    >
                      <X size={15} />
                      Reject
                    </button>
                  </>
                )}

                {request.status === "approved" && (
                  <button
                    className="action-button activate"
                    disabled={updating === request._id}
                    onClick={() =>
                      changeStatus(
                        request._id,
                        "active"
                      )
                    }
                  >
                    <Play size={15} />
                    Start Collaboration
                  </button>
                )}

                {request.status === "active" && (
                  <button
                    className="action-button complete"
                    disabled={updating === request._id}
                    onClick={() =>
                      changeStatus(
                        request._id,
                        "completed"
                      )
                    }
                  >
                    <CircleCheck size={15} />
                    Mark Completed
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

