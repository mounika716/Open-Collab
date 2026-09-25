import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  RefreshCw,
  Sparkles,
  GraduationCap,
  BriefcaseBusiness,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getInstitutionAnalytics,
} from "../services/institutionApi";

import "./InstitutionAnalytics.css";

function InstitutionAnalytics() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getInstitutionAnalytics();

      setAnalytics(response.analytics);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAnalytics();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="institution-analytics-loading">
        <RefreshCw size={18} />
        Loading analytics...
      </div>
    );
  }

  const skills = analytics?.topSkills || [];
const industryDemand =
  analytics?.industryDemand || {};

const demandedSkills =
  industryDemand.skills || [];

const placement =
  analytics?.placement || {};
  return (
    <section className="institution-analytics-page">
      <header className="institution-analytics-header">
        <button
          onClick={() =>
            navigate("/institution")
          }
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>

        <div>
          <span>OPEN COLLAB / ANALYTICS</span>
          <h1>Institution Analytics</h1>
          <p>
            A data view of student skill development,
            certifications, projects and current skill
            demand across the platform.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="institution-analytics-error">
          {error}
        </div>
      )}

      <section className="institution-analytics-stats">
        <article>
          <span>Total students</span>
          <strong>
            {analytics?.totalStudents || 0}
          </strong>
        </article>

        <article>
          <span>Students with skills</span>
          <strong>
            {analytics?.studentsWithSkills || 0}
          </strong>
        </article>

        <article>
          <span>Skill coverage</span>
          <strong>
            {analytics?.skillCoverage || 0}%
          </strong>
        </article>

        <article>
          <span>Certifications</span>
          <strong>
            {analytics?.certificationCount || 0}
          </strong>
        </article>

        <article>
          <span>Projects</span>
          <strong>
            {analytics?.projectCount || 0}
          </strong>
        </article>
      </section>

      <section className="institution-analytics-panel">
        <div className="institution-analytics-panel-title">
          <div>
            <span>SKILL INTELLIGENCE</span>
            <h2>Most tracked student skills</h2>
          </div>

          <BarChart3 size={19} />
        </div>

        {skills.length === 0 ? (
          <div className="institution-analytics-empty">
            <Sparkles size={25} />
            <h3>No skill data yet</h3>
            <p>
              Student skill profiles will appear here
              as learners add and assess their skills.
            </p>
          </div>
        ) : (
          <div className="institution-skill-list">
            {skills.map((skill) => (
              <div
                className="institution-skill-row"
                key={skill.name}
              >
                <div>
                  <strong>{skill.name}</strong>
                  <span>
                    {skill.count} student
                    {skill.count === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="institution-skill-bar">
                  <div
                    style={{
                      width: `${Math.min(
                        skill.count * 12,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <strong>
                  {skill.averageScore}%
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>
            <section className="institution-analytics-grid">
        <article className="institution-analytics-panel">
          <div className="institution-analytics-panel-title">
            <div>
              <span>ASSESSMENT INTELLIGENCE</span>
              <h2>Student readiness</h2>
            </div>

            <GraduationCap size={19} />
          </div>

          <div className="institution-intelligence-stats">
            <div>
              <strong>
                {analytics?.completedAssessments || 0}
              </strong>
              <span>Completed assessments</span>
            </div>

            <div>
              <strong>
                {analytics?.averageAssessmentScore || 0}%
              </strong>
              <span>Average score</span>
            </div>
          </div>

          <p className="institution-analytics-note">
            Assessment performance gives the institution
            a high-level view of student readiness.
          </p>
        </article>

        <article className="institution-analytics-panel">
          <div className="institution-analytics-panel-title">
            <div>
              <span>PLACEMENT INTELLIGENCE</span>
              <h2>Career outcomes</h2>
            </div>

            <BriefcaseBusiness size={19} />
          </div>

          <div className="institution-intelligence-stats">
            <div>
              <strong>
                {placement.selectedJobs || 0}
              </strong>
              <span>Selected</span>
            </div>

            <div>
              <strong>
                {placement.offerJobs || 0}
              </strong>
              <span>Offers</span>
            </div>

            <div>
              <strong>
                {placement.joinedJobs || 0}
              </strong>
              <span>Joined</span>
            </div>

            <div>
              <strong>
                {placement.completedInternships || 0}
              </strong>
              <span>Completed internships</span>
            </div>
          </div>
        </article>
      </section>

      <section className="institution-analytics-panel">
        <div className="institution-analytics-panel-title">
          <div>
            <span>INDUSTRY INTELLIGENCE</span>
            <h2>Current industry skill demand</h2>
          </div>

          <Target size={19} />
        </div>

        <div className="institution-demand-summary">
          <div>
            <strong>
              {industryDemand.openInternships || 0}
            </strong>
            <span>Open internships</span>
          </div>

          <div>
            <strong>
              {industryDemand.openJobs || 0}
            </strong>
            <span>Open jobs</span>
          </div>

          <div>
            <strong>
              {industryDemand.totalDemandedSkills || 0}
            </strong>
            <span>Demanded skills</span>
          </div>

          <div>
            <strong>
              {placement.openAcademicOpportunities || 0}
            </strong>
            <span>Academic opportunities</span>
          </div>
        </div>

        {demandedSkills.length === 0 ? (
          <div className="institution-analytics-empty">
            <Sparkles size={25} />

            <h3>No industry demand data yet</h3>

            <p>
              Skills from open internships and jobs
              will appear here as industries publish
              opportunities.
            </p>
          </div>
        ) : (
          <div className="institution-demand-list">
            {demandedSkills.map((skill) => (
              <div
                className="institution-demand-row"
                key={skill.name}
              >
                <div>
                  <strong>{skill.name}</strong>

                  <span>
                    {skill.internships} internships
                    {" · "}
                    {skill.jobs} jobs
                  </span>
                </div>

                <strong>
                  {skill.demand}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default InstitutionAnalytics;
