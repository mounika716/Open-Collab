import { useEffect, useState, useCallback } from "react";
import {
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  GraduationCap,
  Target,
  UserRound,
} from "lucide-react";

import { getStudentPortfolio } from "../services/portfolioApi";

import "./StudentPortfolio.css";

function formatStatus(status) {
  if (!status) return "Unknown";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function StudentPortfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getStudentPortfolio();

      setPortfolio(response.portfolio);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load your portfolio."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPortfolio();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadPortfolio]);

  if (loading) {
    return (
      <section className="student-portfolio-page">
        <div className="portfolio-state">
          Loading your digital portfolio...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="student-portfolio-page">
        <div className="portfolio-state portfolio-error">
          {error}
        </div>
      </section>
    );
  }

  if (!portfolio) return null;

  const {
    student = {},
    profile = {},
    skills = [],
    projects = [],
    certifications = [],
    assessments = [],
    internships = [],
    placements = [],
    statistics = {},
  } = portfolio;

  return (
    <section className="student-portfolio-page">
      <header className="portfolio-header">
        <div className="portfolio-identity">
          <div className="portfolio-avatar">
            {student.name
              ?.charAt(0)
              ?.toUpperCase() || "S"}
          </div>

          <div>
            <span className="portfolio-eyebrow">
              OPEN COLLAB / DIGITAL PORTFOLIO
            </span>

            <h1>{student.name || "Student"}</h1>

            <p>{student.email}</p>

            <div className="portfolio-academic">
              <GraduationCap size={16} />

              <span>
                {profile.degree || "Degree not set"}
                {profile.branch
                  ? ` · ${profile.branch}`
                  : ""}
                {profile.graduationYear
                  ? ` · ${profile.graduationYear}`
                  : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="portfolio-goal">
          <Target size={18} />

          <div>
            <span>CAREER GOAL</span>
            <strong>
              {profile.careerGoal ||
                "Career goal not set"}
            </strong>
          </div>
        </div>
      </header>

      <section className="portfolio-stats">
        <div className="portfolio-stat">
          <Code2 size={19} />
          <strong>{statistics.skills ?? 0}</strong>
          <span>Skills</span>
        </div>

        <div className="portfolio-stat">
          <BriefcaseBusiness size={19} />
          <strong>{statistics.projects ?? 0}</strong>
          <span>Projects</span>
        </div>

        <div className="portfolio-stat">
          <Award size={19} />
          <strong>
            {statistics.certifications ?? 0}
          </strong>
          <span>Certifications</span>
        </div>

        <div className="portfolio-stat">
          <CheckCircle2 size={19} />
          <strong>
            {statistics.assessmentAverage ?? 0}%
          </strong>
          <span>Assessment Average</span>
        </div>

        <div className="portfolio-stat">
          <BriefcaseBusiness size={19} />
          <strong>
            {statistics.completedInternships ?? 0}
          </strong>
          <span>Internships</span>
        </div>

        <div className="portfolio-stat">
          <Target size={19} />
          <strong>
            {statistics.placementOutcomes ?? 0}
          </strong>
          <span>Placement Outcomes</span>
        </div>
      </section>

      {profile.bio && (
        <section className="portfolio-section">
          <div className="portfolio-section-title">
            <UserRound size={18} />
            <h2>About</h2>
          </div>

          <p className="portfolio-bio">
            {profile.bio}
          </p>

          {profile.interests?.length > 0 && (
            <div className="portfolio-interests">
              {profile.interests.map(
                (interest, index) => (
                  <span key={`${interest}-${index}`}>
                    {interest}
                  </span>
                )
              )}
            </div>
          )}
        </section>
      )}

      <section className="portfolio-section">
        <div className="portfolio-section-title">
          <Code2 size={18} />
          <h2>Verified Skill Profile</h2>
        </div>

        {skills.length === 0 ? (
          <p className="portfolio-empty">
            No skills added yet.
          </p>
        ) : (
          <div className="portfolio-skills">
            {skills.map((skill, index) => {
              const score =
                Number(skill.score) || 0;

              return (
                <div
                  className="portfolio-skill"
                  key={`${skill.name}-${index}`}
                >
                  <div className="portfolio-skill-top">
                    <strong>{skill.name}</strong>

                    <span>
                      {score}% ·{" "}
                      {formatStatus(skill.level)}
                    </span>
                  </div>

                  <div className="portfolio-skill-track">
                    <div
                      className="portfolio-skill-fill"
                      style={{
                        width: `${score}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="portfolio-section">
        <div className="portfolio-section-title">
          <GraduationCap size={18} />
          <h2>Assessment Record</h2>
        </div>

        {assessments.length === 0 ? (
          <p className="portfolio-empty">
            No completed assessments yet.
          </p>
        ) : (
          <div className="portfolio-list">
            {assessments.map((assessment) => (
              <article
                className="portfolio-record"
                key={assessment._id}
              >
                <div>
                  <strong>
                    {assessment.title ||
                      assessment.skill}
                  </strong>

                  <span>
                    {formatStatus(
                      assessment.mode
                    )}
                    {assessment.completedAt
                      ? ` · ${new Date(
                          assessment.completedAt
                        ).toLocaleDateString()}`
                      : ""}
                  </span>
                </div>

                <b>
                  {assessment.score ?? 0}%
                </b>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="portfolio-section">
        <div className="portfolio-section-title">
          <BriefcaseBusiness size={18} />
          <h2>Internship Experience</h2>
        </div>

        {internships.length === 0 ? (
          <p className="portfolio-empty">
            No internship applications yet.
          </p>
        ) : (
          <div className="portfolio-list">
            {internships.map((application) => (
              <article
                className="portfolio-record"
                key={application._id}
              >
                <div>
                  <strong>
                    {application.internship?.title ||
                      "Internship"}
                  </strong>

                  <span>
                    {application.internship?.companyName ||
                      "Company"}
                    {" · "}
                    {formatStatus(
                      application.status
                    )}
                  </span>
                </div>

                <b>
                  {application.matchPercentage || 0}%
                </b>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="portfolio-section">
        <div className="portfolio-section-title">
          <Target size={18} />
          <h2>Placement Journey</h2>
        </div>

        {placements.length === 0 ? (
          <p className="portfolio-empty">
            No job applications yet.
          </p>
        ) : (
          <div className="portfolio-list">
            {placements.map((application) => (
              <article
                className="portfolio-record"
                key={application._id}
              >
                <div>
                  <strong>
                    {application.job?.title ||
                      "Job Application"}
                  </strong>

                  <span>
                    {application.job?.companyName ||
                      "Company"}
                    {" · "}
                    {formatStatus(
                      application.status
                    )}
                  </span>
                </div>

                <b>
                  {application.matchPercentage || 0}%
                </b>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="portfolio-two-column">
        <div className="portfolio-section">
          <div className="portfolio-section-title">
            <Code2 size={18} />
            <h2>Projects</h2>
          </div>

          {projects.length === 0 ? (
            <p className="portfolio-empty">
              No projects added yet.
            </p>
          ) : (
            <div className="portfolio-projects">
              {projects.map((project, index) => (
                <article
                  className="portfolio-project"
                  key={`${project.title}-${index}`}
                >
                  <h3>{project.title}</h3>

                  <p>
                    {project.description}
                  </p>

                  {project.technologies?.length >
                    0 && (
                    <div className="portfolio-tags">
                      {project.technologies.map(
                        (technology, techIndex) => (
                          <span
                            key={`${technology}-${techIndex}`}
                          >
                            {technology}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="portfolio-section">
          <div className="portfolio-section-title">
            <Award size={18} />
            <h2>Certifications</h2>
          </div>

          {certifications.length === 0 ? (
            <p className="portfolio-empty">
              No certifications added yet.
            </p>
          ) : (
            <div className="portfolio-list">
              {certifications.map(
                (certificate, index) => (
                  <article
                    className="portfolio-record"
                    key={`${certificate.name}-${index}`}
                  >
                    <div>
                      <strong>
                        {certificate.name}
                      </strong>

                      <span>
                        {certificate.issuingOrganization || "Organization"}
                        {certificate.issueDate
                          ? ` · ${new Date(
                              certificate.issueDate
                            ).toLocaleDateString()}`
                          : ""}
                      </span>
                    </div>

                    {certificate.credentialUrl && (
                      <a
                        href={certificate.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="portfolio-link"
                      >
                        View Credential
                      </a>
                    )}
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

export default StudentPortfolio;
