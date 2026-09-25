import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  FileText,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import {
  getStudentProfile,
  getCareerIntelligence,
} from "../services/studentApi";
import { getMyApplications } from "../services/applicationApi";
import {
  getInternships,
  getInternshipMatch,
} from "../services/internshipApi";

import "./StudentDashboard.css";

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        profileResult,
        applicationsResult,
        internshipsResult,
        intelligenceResult,
      ] = await Promise.all([
        getStudentProfile(),
        getMyApplications(),
        getInternships(),
        getCareerIntelligence(),
      ]);

      const studentProfile = profileResult.profile || null;

      const studentApplications =
        applicationsResult.applications || [];

      const availableInternships =
        internshipsResult.internships || [];

      setProfile(studentProfile);
      setApplications(studentApplications);
      setIntelligence(
        intelligenceResult.intelligence || null
      );

      const topInternships =
        availableInternships.slice(0, 5);

      const scoredInternships = await Promise.all(
        topInternships.map(async (internship) => {
          try {
            const match =
              await getInternshipMatch(internship._id);

            return {
              ...internship,
              matchPercentage:
                match.matchPercentage ?? 0,
            };
          } catch {
            return {
              ...internship,
              matchPercentage: 0,
            };
          }
        })
      );

      scoredInternships.sort(
        (a, b) =>
          b.matchPercentage - a.matchPercentage
      );

      setRecommendations(
        scoredInternships.slice(0, 3)
      );
    } catch (err) {
      console.error(
        "Student dashboard error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
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

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;

    const checks = [
      Boolean(profile.phone),
      Boolean(profile.college),
      Boolean(profile.degree),
      Boolean(profile.branch),
      Boolean(profile.graduationYear),
      Boolean(profile.bio),
      Boolean(profile.careerGoal),
      profile.skills?.length > 0,
      profile.interests?.length > 0,
      profile.projects?.length > 0,
      profile.certifications?.length > 0,
    ];

    const completed =
      checks.filter(Boolean).length;

    return Math.round(
      (completed / checks.length) * 100
    );
  }, [profile]);

  const skillCount =
    profile?.skills?.length || 0;

  const pendingApplications =
    applications.filter(
      (application) =>
        application.status === "pending"
    ).length;

  const shortlistedApplications =
    applications.filter(
      (application) =>
        application.status === "shortlisted"
    ).length;

  const acceptedApplications =
    applications.filter(
      (application) =>
        application.status === "accepted"
    ).length;

  const skillGaps = useMemo(() => {
    if (intelligence?.skillGaps?.length) {
      return intelligence.skillGaps
        .map((item) => item.skill)
        .filter(Boolean)
        .slice(0, 4);
    }

    const studentSkills = new Set(
      (profile?.skills || []).map((skill) =>
        skill.name?.trim().toLowerCase()
      )
    );

    const gaps = [];

    recommendations.forEach((internship) => {
      (internship.requiredSkills || []).forEach(
        (requiredSkill) => {
          const name =
            requiredSkill.name?.trim();

          if (
            name &&
            !studentSkills.has(
              name.toLowerCase()
            ) &&
            !gaps.some(
              (item) =>
                item.toLowerCase() ===
                name.toLowerCase()
            )
          ) {
            gaps.push(name);
          }
        }
      );
    });

    return gaps.slice(0, 4);
  }, [
    profile,
    recommendations,
    intelligence,
  ]);

  const recentApplications =
    applications.slice(0, 4);

  if (loading) {
    return (
      <div className="student-dashboard-state">
        <RefreshCw
          size={20}
          className="student-dashboard-spin"
        />
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <header className="student-dashboard-header">
        <div>
          <p className="student-dashboard-eyebrow">
            OPEN COLLAB / STUDENT
          </p>

          <h1>
            Welcome{" "}
            <span>
              {user?.name || "Student"}
            </span>
          </h1>

          <p className="student-dashboard-intro">
            Track your skills, discover relevant
            opportunities and monitor your career
            progress from one place.
          </p>
        </div>

        <button
          className="student-profile-action"
          onClick={() =>
            navigate("/student/profile")
          }
        >
          <CircleUserRound size={17} />
          View Profile
        </button>

        <button
          onClick={() =>
            navigate("/student/portfolio")
          }
        >
          <BriefcaseBusiness size={16} />
          Digital Portfolio
        </button>
      </header>

      {error && (
        <div className="student-dashboard-error">
          <XCircle size={17} />
          <span>{error}</span>

          <button onClick={loadDashboard}>
            Retry
          </button>
        </div>
      )}

      <section className="student-stat-grid">
        <article className="student-stat-card">
          <div className="student-stat-icon">
            <Target size={19} />
          </div>

          <span>Profile completion</span>

          <strong>
            {profileCompletion}%
          </strong>

          <div className="student-progress">
            <span
              style={{
                width: `${profileCompletion}%`,
              }}
            />
          </div>
        </article>

        <article className="student-stat-card">
          <div className="student-stat-icon">
            <Sparkles size={19} />
          </div>

          <span>Skills added</span>

          <strong>{skillCount}</strong>

          <small>
            {skillCount
              ? "Keep building your profile"
              : "Add your first skill"}
          </small>
        </article>

        <article className="student-stat-card">
          <div className="student-stat-icon">
            <FileText size={19} />
          </div>

          <span>Applications</span>

          <strong>
            {applications.length}
          </strong>

          <small>
            {pendingApplications} pending
          </small>
        </article>

        <article className="student-stat-card">
          <div className="student-stat-icon">
            <CheckCircle2 size={19} />
          </div>

          <span>Shortlisted</span>

          <strong>
            {shortlistedApplications}
          </strong>

          <small>
            {acceptedApplications} accepted
          </small>
        </article>
      </section>

      <section className="student-dashboard-grid">
        <div className="student-dashboard-main">
          <section className="student-dashboard-card">
            <div className="student-card-heading">
              <div>
                <span>OPPORTUNITIES</span>

                <h2>
                  Recommended internships
                </h2>
              </div>

              <button
                onClick={() =>
                  navigate(
                    "/student/internships"
                  )
                }
              >
                View all
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() =>
                  navigate(
                    "/student/portfolio"
                  )
                }
              >
                <BriefcaseBusiness size={16} />
                Digital Portfolio
              </button>
            </div>

            {recommendations.length === 0 ? (
              <div className="student-empty-state">
                <BriefcaseBusiness size={24} />

                <h3>
                  No recommendations yet
                </h3>

                <p>
                  Complete your profile and add
                  skills to discover internships.
                </p>

                <button
                  onClick={() =>
                    navigate(
                      "/student/profile"
                    )
                  }
                >
                  Complete profile
                </button>

                <button
                  onClick={() =>
                    navigate(
                      "/student/portfolio"
                    )
                  }
                >
                  <BriefcaseBusiness size={16} />
                  Digital Portfolio
                </button>
              </div>
            ) : (
              <div className="recommendation-list">
                {recommendations.map(
                  (internship) => (
                    <button
                      className="recommendation-item"
                      key={internship._id}
                      onClick={() =>
                        navigate(
                          `/student/internships/${internship._id}`
                        )
                      }
                    >
                      <div className="recommendation-mark">
                        {internship.companyName
                          ?.charAt(0)
                          .toUpperCase() || "I"}
                      </div>

                      <div className="recommendation-content">
                        <strong>
                          {internship.title}
                        </strong>

                        <span>
                          {internship.companyName}
                          {" · "}
                          {internship.location ||
                            "Remote"}
                        </span>

                        <small>
                          {internship.duration}
                          {" · "}
                          {internship.stipend ||
                            "Unpaid"}
                        </small>
                      </div>

                      <div className="recommendation-match">
                        <strong>
                          {internship.matchPercentage}%
                        </strong>

                        <span>match</span>
                      </div>

                      <ArrowRight
                        size={17}
                        className="recommendation-arrow"
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </section>

          <section className="student-dashboard-card">
            <div className="student-card-heading">
              <div>
                <span>APPLICATIONS</span>

                <h2>
                  Recent applications
                </h2>
              </div>

              <button
                onClick={() =>
                  navigate(
                    "/student/applications"
                  )
                }
              >
                View all
                <ArrowRight size={15} />
              </button>
            </div>

            {recentApplications.length === 0 ? (
              <div className="student-empty-state compact">
                <FileText size={22} />

                <p>
                  You haven't applied to an
                  internship yet.
                </p>

                <button
                  onClick={() =>
                    navigate(
                      "/student/internships"
                    )
                  }
                >
                  Explore internships
                </button>
              </div>
            ) : (
              <div className="application-list">
                {recentApplications.map(
                  (application) => (
                    <div
                      className="dashboard-application"
                      key={application._id}
                    >
                      <div>
                        <strong>
                          {application.internship
                            ?.title ||
                            "Internship"}
                        </strong>

                        <span>
                          {application.internship
                            ?.companyName ||
                            "Company"}
                        </span>
                      </div>

                      <span
                        className={`dashboard-status ${application.status}`}
                      >
                        {application.status}
                      </span>

                      <small>
                        {application.matchPercentage ??
                          0}
                        % match
                      </small>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="student-dashboard-side">
          <section className="student-dashboard-card readiness-card">
            <div className="student-card-heading">
              <div>
                <span>CAREER READINESS</span>

                <h2>Your progress</h2>
              </div>
            </div>

            <div className="readiness-score">
              <div
                className="readiness-ring"
                style={{
                  "--progress": `${profileCompletion}%`,
                }}
              >
                <strong>
                  {profileCompletion}%
                </strong>
              </div>

              <div>
                <strong>
                  Profile readiness
                </strong>

                <p>
                  Complete more profile details
                  to improve your opportunities.
                </p>
              </div>
            </div>

            <div className="readiness-steps">
              <div>
                <CheckCircle2 size={16} />

                <span>
                  Profile created
                </span>
              </div>

              <div
                className={
                  skillCount
                    ? "complete"
                    : ""
                }
              >
                {skillCount ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Clock3 size={16} />
                )}

                <span>
                  Skills added
                </span>
              </div>

              <div
                className={
                  applications.length
                    ? "complete"
                    : ""
                }
              >
                {applications.length ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Clock3 size={16} />
                )}

                <span>
                  Internship applications
                </span>
              </div>
            </div>
          </section>

          <section className="student-dashboard-card">
            <div className="student-card-heading">
              <div>
                <span>SKILL INTELLIGENCE</span>

                <h2>Current gaps</h2>
              </div>

              <TrendingUp size={18} />
            </div>

            {skillGaps.length === 0 ? (
              <p className="dashboard-muted">
                No obvious skill gaps found from
                your current recommendations.
              </p>
            ) : (
              <div className="skill-gap-list">
                {skillGaps.map((skill) => (
                  <div
                    className="skill-gap"
                    key={skill}
                  >
                    <span>{skill}</span>
                    <ArrowRight size={14} />
                  </div>
                ))}
              </div>
            )}

            <button
              className="dashboard-secondary-button"
              onClick={() =>
                navigate("/student/skills")
              }
            >
              Review my skills
              <ArrowRight size={15} />
            </button>
          </section>
        </aside>
      </section>
    </div>
  );
}

export default StudentDashboard;
