import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getOpportunities } from "../services/opportunityApi";
import {
  applyForCollaboration,
  getMyCollaborationRequests,
} from "../services/collaborationApi";

import "./StudentCollaborationOpportunities.css";

const opportunityTypes = {
  faculty_internship: "Faculty Internship",
  industrial_training: "Industrial Training",
  fdp: "FDP",
  workshop: "Workshop",
  consultancy: "Consultancy",
  research: "Collaborative Research",
  guest_lecture: "Guest Lecture",
  mentorship: "Mentorship",
  live_project: "Live Industry Project",
  innovation_challenge: "Innovation Challenge",
};

function formatDate(date) {
  if (!date) {
    return "No date";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StudentCollaborationOpportunities() {
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [requests, setRequests] = useState([]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [opportunityResponse, requestResponse] =
        await Promise.all([
          getOpportunities({ status: "open" }),
          getMyCollaborationRequests(),
        ]);

      setOpportunities(
        opportunityResponse.opportunities || []
      );

      setRequests(requestResponse.requests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load collaboration opportunities."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const appliedOpportunityIds = useMemo(() => {
    return new Set(
      requests
        .map((request) => request.opportunity?._id)
        .filter(Boolean)
    );
  }, [requests]);

  const filteredOpportunities = useMemo(() => {
    const query = search.toLowerCase().trim();

    return opportunities.filter((opportunity) => {
      const matchesType =
        typeFilter === "all" ||
        opportunity.type === typeFilter;

      if (!matchesType) {
        return false;
      }

      if (!query) {
        return true;
      }

      const skills = (
        opportunity.skills || []
      ).join(" ");

      const searchableText = [
        opportunity.title,
        opportunity.organization,
        opportunity.description,
        opportunity.createdByRole,
        opportunity.mode,
        opportunity.location,
        skills,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [opportunities, search, typeFilter]);

  const handleApply = async (opportunity) => {
    const opportunityId = opportunity._id;

    if (appliedOpportunityIds.has(opportunityId)) {
      return;
    }

    const messageText = window.prompt(
      "Add a short message to the opportunity creator (optional):",
      ""
    );

    if (messageText === null) {
      return;
    }

    try {
      setApplyingId(opportunityId);
      setError("");
      setMessage("");

      await applyForCollaboration(
        opportunityId,
        messageText
      );

      setMessage(
        "Collaboration request submitted successfully."
      );

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit collaboration request."
      );
    } finally {
      setApplyingId("");
    }
  };

  return (
    <div className="student-collaboration-opportunities">
      <header className="student-collaboration-hero">
        <div>
          <span className="collaboration-opportunities-eyebrow">
            OPEN COLLAB / ACADEMIA × INDUSTRY
          </span>

          <h1>
            Collaboration Opportunities
          </h1>

          <p>
            Discover mentorships, workshops, research,
            live projects, training and other
            opportunities shared by academia and industry.
          </p>
        </div>

        <button
          className="collaboration-refresh"
          type="button"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading ? "collaboration-spin" : ""
            }
          />
          Refresh
        </button>
      </header>

      <section className="collaboration-toolbar">
        <div className="collaboration-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search opportunities, organizations or skills..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value)
          }
        >
          <option value="all">
            All opportunity types
          </option>

          {Object.entries(opportunityTypes).map(
            ([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            )
          )}
        </select>
      </section>

      {error && (
        <div className="collaboration-opportunities-error">
          {error}
        </div>
      )}

      {message && (
        <div className="collaboration-opportunities-message">
          {message}
        </div>
      )}

      {loading ? (
        <div className="collaboration-opportunities-loading">
          <RefreshCw
            size={18}
            className="collaboration-spin"
          />
          Loading collaboration opportunities...
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <section className="collaboration-opportunities-empty">
          <Search size={28} />

          <h2>No opportunities found</h2>

          <p>
            Try changing your search or selecting a
            different opportunity type.
          </p>
        </section>
      ) : (
        <section className="collaboration-opportunities-grid">
          {filteredOpportunities.map((opportunity) => {
            const isApplied =
              appliedOpportunityIds.has(
                opportunity._id
              );

            const isApplying =
              applyingId === opportunity._id;

            return (
              <article
                className="student-collaboration-opportunity-card"
                key={opportunity._id}
              >
                <div className="student-collaboration-card-top">
                  <div className="student-collaboration-type">
                    {opportunityTypes[
                      opportunity.type
                    ] || opportunity.type}
                  </div>

                  <span className="student-collaboration-open">
                    Open
                  </span>
                </div>

                <div className="student-collaboration-card-body">
                  <span className="student-collaboration-organization">
                    {opportunity.organization}
                  </span>

                  <h2>{opportunity.title}</h2>

                  <p>
                    {opportunity.description}
                  </p>

                  <div className="student-collaboration-meta">
                    <span>
                      <MapPin size={14} />
                      {opportunity.mode || "Online"}
                      {opportunity.location
                        ? ` · ${opportunity.location}`
                        : ""}
                    </span>

                    <span>
                      <CalendarDays size={14} />
                      Deadline:{" "}
                      {formatDate(
                        opportunity.deadline
                      )}
                    </span>

                    <span>
                      <Users size={14} />
                      {opportunity.seats || 1} seat
                      {opportunity.seats === 1
                        ? ""
                        : "s"}
                    </span>

                    <span>
                      <Clock3 size={14} />
                      {opportunity.createdByRole}
                    </span>
                  </div>

                  {(opportunity.skills || []).length >
                    0 && (
                    <div className="student-collaboration-skills">
                      {opportunity.skills.map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="student-collaboration-card-footer">
                  <button
                    type="button"
                    className="student-collaboration-view"
                    onClick={() =>
                      navigate(
                        `/student/collaborations?opportunity=${opportunity._id}`
                      )
                    }
                  >
                    View
                    <ArrowRight size={15} />
                  </button>

                  <button
                    type="button"
                    className={
                      isApplied
                        ? "student-collaboration-applied"
                        : "student-collaboration-apply"
                    }
                    onClick={() =>
                      handleApply(opportunity)
                    }
                    disabled={
                      isApplied || isApplying
                    }
                  >
                    {isApplying
                      ? "Applying..."
                      : isApplied
                      ? "Applied"
                      : "Apply"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default StudentCollaborationOpportunities;
