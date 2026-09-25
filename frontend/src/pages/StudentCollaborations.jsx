import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  XCircle,
  Activity,
} from "lucide-react";

import {
  getMyCollaborationRequests,
} from "../services/collaborationApi";

import "./StudentCollaborations.css";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
  },
  active: {
    label: "Active",
    icon: Activity,
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
  },
};

export default function StudentCollaborations() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const loadRequests = async () => {
    try {
      setLoading(true);

      const data = await getMyCollaborationRequests();

      setRequests(data.requests || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load collaborations"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRequests();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="student-collaborations">
        <div className="collaboration-loading">
          Loading collaborations...
        </div>
      </div>
    );
  }

  return (
    <div className="student-collaborations">
      <div className="collaboration-header">
        <div>
          <p className="eyebrow">ACADEMIA × INDUSTRY</p>

          <h1>My Collaborations</h1>

          <p>
            Track workshops, mentorships, research,
            live projects and other collaboration
            opportunities.
          </p>
        </div>

        <div className="collaboration-count">
          {requests.length}
          <span>requests</span>
        </div>
      </div>

      {error && (
        <div className="collaboration-error">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="empty-collaboration">
          <h3>No collaboration requests yet</h3>

          <p>
            Apply to mentorships, workshops, live projects
            and other opportunities to see them here.
          </p>
        </div>
      ) : (
        <div className="collaboration-grid">
          {requests.map((request) => {
            const config =
              statusConfig[request.status] ||
              statusConfig.pending;

            const Icon = config.icon;

            return (
              <article
                className="collaboration-card"
                key={request._id}
              >
                <div className="collaboration-card-top">
                  <div>
                    <span className="collaboration-type">
                      {request.opportunity?.type
                        ?.replaceAll("_", " ")
                        .toUpperCase()}
                    </span>

                    <h2>
                      {request.opportunity?.title}
                    </h2>

                    <p>
                      {request.opportunity?.organization}
                    </p>
                  </div>

                  <div
                    className={`collaboration-status ${request.status}`}
                  >
                    <Icon size={15} />

                    {config.label}
                  </div>
                </div>

                <p className="collaboration-description">
                  {request.opportunity?.description}
                </p>

                <div className="collaboration-progress">
                  <div className="progress-heading">
                    <span>Progress</span>

                    <strong>
                      {request.progress || 0}%
                    </strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-value"
                      style={{
                        width: `${request.progress || 0}%`,
                      }}
                    />
                  </div>
                </div>

                {request.feedback && (
                  <div className="collaboration-feedback">
                    <strong>Feedback</strong>

                    <p>{request.feedback}</p>
                  </div>
                )}

                {request.completionNote && (
                  <div className="collaboration-feedback">
                    <strong>Completion note</strong>

                    <p>{request.completionNote}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
