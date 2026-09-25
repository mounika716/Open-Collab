import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  BriefcaseBusiness,
  GraduationCap,
  RefreshCw,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  getInstitutionDashboard,
} from "../services/institutionApi";

import "./InstitutionDashboard.css";

function InstitutionDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getInstitutionDashboard();

      setDashboard(response.dashboard);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load institution dashboard."
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
      <div className="institution-dashboard-loading">
        <RefreshCw size={18} />
        Loading institution dashboard...
      </div>
    );
  }

  return (
    <section className="institution-dashboard-page">
      <header className="institution-dashboard-header">
        <div>
          <span>OPEN COLLAB / INSTITUTION</span>

          <h1>
            Welcome, {user?.name}
          </h1>

          <p>
            Monitor academic talent, industry activity,
            internships and placement progress from one
            institutional workspace.
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/institution/analytics")
          }
        >
          <BarChart3 size={16} />
          View analytics
        </button>
      </header>

      {error && (
        <div className="institution-dashboard-error">
          {error}
        </div>
      )}

      <section className="institution-dashboard-stats">
        <article>
          <Users size={19} />
          <span>Students</span>
          <strong>{dashboard?.students || 0}</strong>
        </article>

        <article>
          <GraduationCap size={19} />
          <span>Academicians</span>
          <strong>
            {dashboard?.academicians || 0}
          </strong>
        </article>

        <article>
          <Building2 size={19} />
          <span>Industry accounts</span>
          <strong>
            {dashboard?.industries || 0}
          </strong>
        </article>

        <article>
          <BriefcaseBusiness size={19} />
          <span>Open internships</span>
          <strong>
            {dashboard?.openInternships || 0}
          </strong>
        </article>

        <article>
          <BriefcaseBusiness size={19} />
          <span>Open jobs</span>
          <strong>
            {dashboard?.openJobs || 0}
          </strong>
        </article>

        <article>
          <BarChart3 size={19} />
          <span>Accepted placements</span>
          <strong>
            {dashboard?.acceptedJobs || 0}
          </strong>
        </article>
      </section>

      <section className="institution-dashboard-grid">
        <article className="institution-dashboard-panel">
          <span>PLACEMENT ACTIVITY</span>
          <h2>Applications and outcomes</h2>

          <div className="institution-dashboard-list">
            <div>
              <span>Internship applications</span>
              <strong>
                {dashboard?.internshipApplications || 0}
              </strong>
            </div>

            <div>
              <span>Accepted internships</span>
              <strong>
                {dashboard?.acceptedInternships || 0}
              </strong>
            </div>

            <div>
              <span>Job applications</span>
              <strong>
                {dashboard?.jobApplications || 0}
              </strong>
            </div>

            <div>
              <span>Accepted jobs</span>
              <strong>
                {dashboard?.acceptedJobs || 0}
              </strong>
            </div>
          </div>
        </article>

        <article className="institution-dashboard-panel">
          <span>ACADEMIC-INDUSTRY</span>
          <h2>Collaboration pipeline</h2>

          <div className="institution-collab-number">
            {dashboard?.openAcademicOpportunities || 0}
          </div>

          <p>
            Open academic opportunities currently
            available across the platform.
          </p>

          <button
            onClick={() =>
              navigate("/institution/analytics")
            }
          >
            Explore analytics
            <ArrowRight size={15} />
          </button>
        </article>
      </section>
    </section>
  );
}

export default InstitutionDashboard;
