import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  CircleUserRound,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getAcademicianDashboard } from "../services/academicianApi";

import "./AcademicianDashboard.css";

function AcademicianDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAcademicianDashboard();

      setDashboard(data.dashboard);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard."
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

  if (loading) {
    return (
      <div className="academician-dashboard-loading">
        <RefreshCw size={18} />
        Loading dashboard...
      </div>
    );
  }

  return (
    <section className="academician-dashboard-page">
      <header className="academician-dashboard-header">
        <div>
          <span>
            OPEN COLLAB / ACADEMICIAN
          </span>

          <h1>
            Welcome, {user?.name}
          </h1>

          <p>
            Manage your academic-industry
            opportunities, collaborations and
            professional profile from one place.
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/academician/opportunities")
          }
          className="academician-dashboard-primary"
        >
          <Plus size={17} />
          Create opportunity
        </button>
      </header>

      {error && (
        <div className="academician-dashboard-error">
          {error}
        </div>
      )}

      <section className="academician-dashboard-stats">
        <article>
          <div className="academician-stat-icon">
            <CircleUserRound size={18} />
          </div>

          <span>Profile completion</span>

          <strong>
            {dashboard?.profileCompletion || 0}%
          </strong>
        </article>

        <article>
          <div className="academician-stat-icon">
            <BriefcaseBusiness size={18} />
          </div>

          <span>My opportunities</span>

          <strong>
            {dashboard?.myOpportunityCount || 0}
          </strong>
        </article>

        <article>
          <div className="academician-stat-icon">
            <Building2 size={18} />
          </div>

          <span>Open opportunities</span>

          <strong>
            {dashboard?.openOpportunityCount || 0}
          </strong>
        </article>
      </section>

      <section className="academician-dashboard-main">
        <div className="academician-dashboard-panel">
          <div className="academician-dashboard-panel-header">
            <div>
              <span>RECENT ACTIVITY</span>
              <h2>My published opportunities</h2>
            </div>

            <button
              onClick={() =>
                navigate("/academician/opportunities")
              }
            >
              View all
              <ArrowRight size={15} />
            </button>
          </div>

          {dashboard?.recentOpportunities?.length ? (
            <div className="academician-recent-list">
              {dashboard.recentOpportunities.map(
                (opportunity) => (
                  <article
                    key={opportunity._id}
                    className="academician-recent-row"
                  >
                    <div>
                      <strong>
                        {opportunity.title}
                      </strong>

                      <span>
                        {opportunity.organization}
                      </span>
                    </div>

                    <small>
                      {opportunity.status}
                    </small>
                  </article>
                )
              )}
            </div>
          ) : (
            <div className="academician-dashboard-empty">
              <BriefcaseBusiness size={25} />

              <h3>
                No opportunities published yet
              </h3>

              <p>
                Create your first academic-industry
                opportunity to start collaborating.
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/academician/opportunities"
                  )
                }
              >
                Create opportunity
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>

        <aside className="academician-dashboard-panel">
          <div className="academician-dashboard-panel-header">
            <div>
              <span>QUICK ACCESS</span>
              <h2>Continue working</h2>
            </div>

            <ChartNoAxesCombined size={18} />
          </div>

          <div className="academician-quick-actions">
            <button
              onClick={() =>
                navigate("/academician/profile")
              }
            >
              <CircleUserRound size={17} />
              <span>
                <strong>Profile</strong>
                <small>
                  Complete your academic profile
                </small>
              </span>
            </button>

            <button
              onClick={() =>
                navigate(
                  "/academician/training"
                )
              }
            >
              <BriefcaseBusiness size={17} />
              <span>
                <strong>Training & FDP</strong>
                <small>
                  Publish or discover training
                </small>
              </span>
            </button>

            <button
              onClick={() =>
                navigate(
                  "/academician/consultancy"
                )
              }
            >
              <Building2 size={17} />
              <span>
                <strong>Consultancy</strong>
                <small>
                  Explore consultancy work
                </small>
              </span>
            </button>

            <button
              onClick={() =>
                navigate(
                  "/academician/research"
                )
              }
            >
              <ChartNoAxesCombined size={17} />
              <span>
                <strong>Research</strong>
                <small>
                  Find research collaborations
                </small>
              </span>
            </button>
          </div>
        </aside>
      </section>
    </section>
  );
}

export default AcademicianDashboard;
