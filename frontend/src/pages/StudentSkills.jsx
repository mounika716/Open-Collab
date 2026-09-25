import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CircleAlert,
  RefreshCw,
  Sparkles,
  UserRound,
  TrendingUp,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getStudentProfile,
  getCareerIntelligence,
  getSkillGapIntelligence,
} from "../services/studentApi";

import "./StudentSkills.css";

function getScoreClass(score) {
  if (score >= 80) return "strong";
  if (score >= 60) return "good";
  if (score >= 40) return "developing";
  return "needs-work";
}

function getLevelLabel(level) {
  if (level === "advanced") return "Advanced";
  if (level === "intermediate") return "Intermediate";
  return "Beginner";
}

function StudentSkills() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        profileResult,
        intelligenceResult,
        skillGapResult,
      ] = await Promise.all([
        getStudentProfile(),
        getCareerIntelligence(),
        getSkillGapIntelligence(),
      ]);

      setProfile(profileResult.profile || null);

      setIntelligence(
        intelligenceResult.intelligence || null
      );

      setSkillGap(skillGapResult || null);
    } catch (err) {
      console.error("Student skills loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your skills."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSkills();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="student-skills-loading">
        <RefreshCw
          className="skills-spinner"
          size={18}
        />
        Loading your skills...
      </div>
    );
  }

  const skills = profile?.skills || [];

  const strengths = intelligence?.strengths || [];

  const skillGaps =
    intelligence?.skillGaps || [];

  const industryComparison =
    skillGap?.comparison || [];

  const industryGaps =
    skillGap?.gaps || [];

  const matchedIndustrySkills =
    skillGap?.matchedSkills || [];

  return (
    <div className="student-skills-page">
      <header className="student-skills-header">
        <button
          className="skills-back-button"
          onClick={() => navigate("/student")}
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>

        <div className="skills-heading">
          <span>OPEN COLLAB / SKILLS</span>

          <h1>My Skills</h1>

          <p>
            Track your skills and understand where
            you can improve.
          </p>
        </div>

        <button
          className="skills-refresh-button"
          onClick={loadSkills}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="skills-error">
          <CircleAlert size={17} />
          {error}
        </div>
      )}

      <section className="skills-overview">
        <div>
          <Sparkles size={18} />

          <strong>{skills.length}</strong>

          <span>Skills added</span>
        </div>

        <div>
          <UserRound size={18} />

          <strong>
            {profile?.careerGoal || "Not set"}
          </strong>

          <span>Career goal</span>
        </div>
      </section>

      {skills.length === 0 ? (
        <section className="skills-empty">
          <Sparkles size={30} />

          <h2>No skills added yet</h2>

          <p>
            Add your technical and professional
            skills from your student profile.
          </p>

          <button
            onClick={() =>
              navigate("/student/profile")
            }
          >
            Complete Profile
          </button>
        </section>
      ) : (
        <>
          <section className="skills-section">
            <div className="skills-section-heading">
              <div>
                <span>YOUR PROFILE</span>

                <h2>Skill Overview</h2>
              </div>

              <button
                onClick={() =>
                  navigate("/student/profile")
                }
              >
                Edit Skills
              </button>
            </div>

            <div className="skills-grid">
              {skills.map((skill, index) => {
                const score =
                  Number(skill.score) || 0;

                const scoreClass =
                  getScoreClass(score);

                return (
                  <article
                    className="skill-card"
                    key={`${skill.name}-${index}`}
                  >
                    <div className="skill-card-header">
                      <div>
                        <small>
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </small>

                        <h3>{skill.name}</h3>
                      </div>

                      <span
                        className={`skill-level ${scoreClass}`}
                      >
                        {getLevelLabel(
                          skill.level
                        )}
                      </span>
                    </div>

                    <div className="skill-score">
                      <span>
                        Current score
                      </span>

                      <strong>
                        {score}%
                      </strong>
                    </div>

                    <div className="skill-progress">
                      <div
                        className={`skill-progress-fill ${scoreClass}`}
                        style={{
                          width: `${score}%`,
                        }}
                      />
                    </div>

                    <div className="skill-card-footer">
                      <span>
                        {score >= 70
                          ? "Strong foundation"
                          : score >= 40
                          ? "Keep developing"
                          : "Needs improvement"}
                      </span>

                      <button
                        onClick={() =>
                          navigate(
                            `/student/assessment/${encodeURIComponent(
                              skill.name
                            )}`
                          )
                        }
                      >
                        Assess
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="skills-intelligence-grid">
            <article className="skills-intelligence-card">
              <div className="intelligence-card-heading">
                <TrendingUp size={19} />

                <div>
                  <span>AI INSIGHT</span>

                  <h2>Your Strengths</h2>
                </div>
              </div>

              {strengths.length === 0 ? (
                <p className="intelligence-empty">
                  Complete assessments to identify
                  your strongest skills.
                </p>
              ) : (
                <div className="intelligence-list">
                  {strengths.map(
                    (item, index) => (
                      <div
                        className="intelligence-item"
                        key={`${item.name}-${index}`}
                      >
                        <div>
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            Assessment score:{" "}
                            {item.score}%
                          </span>
                        </div>

                        <b>
                          {item.score}%
                        </b>
                      </div>
                    )
                  )}
                </div>
              )}
            </article>

            <article className="skills-intelligence-card">
              <div className="intelligence-card-heading">
                <Target size={19} />

                <div>
                  <span>AI INSIGHT</span>

                  <h2>Skill Gaps</h2>
                </div>
              </div>

              {skillGaps.length === 0 ? (
                <p className="intelligence-empty">
                  No major skill gaps detected yet.
                </p>
              ) : (
                <div className="intelligence-list">
                  {skillGaps.map(
                    (item, index) => (
                      <div
                        className="intelligence-item"
                        key={`${item.name}-${index}`}
                      >
                        <div>
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            Current score:{" "}
                            {item.score}%
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            navigate(
                              `/student/assessment/${encodeURIComponent(
                                item.name
                              )}`
                            )
                          }
                        >
                          Improve
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </article>
          </section>

          <section className="skills-intelligence-card industry-alignment-card">
            <div className="intelligence-card-heading">
              <Target size={19} />

              <div>
                <span>
                  INDUSTRY ALIGNMENT
                </span>

                <h2>
                  Industry Skill Gap
                </h2>
              </div>
            </div>

            <div className="industry-gap-summary">
              <div>
                <strong>
                  {matchedIndustrySkills.length}
                </strong>

                <span>
                  Matched skills
                </span>
              </div>

              <div>
                <strong>
                  {industryGaps.length}
                </strong>

                <span>
                  Priority gaps
                </span>
              </div>

              <div>
                <strong>
                  {skillGap?.summary
                    ?.demandedSkills || 0}
                </strong>

                <span>
                  Demanded skills
                </span>
              </div>
            </div>

            {industryComparison.length > 0 ? (
              <div className="industry-gap-list">
                {industryComparison.map(
                  (item) => (
                    <div
                      className="industry-gap-item"
                      key={item.skill}
                    >
                      <div>
                        <strong>
                          {item.skill}
                        </strong>

                        <span>
                          Industry demand:{" "}
                          {item.demand}
                          {" · "}
                          {item.internships}{" "}
                          internships
                          {" · "}
                          {item.jobs} jobs
                        </span>
                      </div>

                      <span
                        className={
                          item.hasSkill
                            ? "industry-gap-match"
                            : "industry-gap-missing"
                        }
                      >
                        {item.hasSkill
                          ? "Matched"
                          : "Gap"}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="intelligence-empty">
                No industry demand data is
                available yet. Industry
                internships and jobs with
                required skills will appear here.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default StudentSkills;
