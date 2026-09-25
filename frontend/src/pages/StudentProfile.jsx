import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getStudentProfile,
  updateStudentProfile,
} from "../services/studentApi";

import "./StudentProfile.css";

const emptySkill = {
  name: "",
  level: "beginner",
  score: 0,
};

function StudentProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    phone: "",
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    bio: "",
    careerGoal: "",
    interests: [],
    skills: [],
    certifications: [],
    projects: [],
  });

  const [interestInput, setInterestInput] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);

      const data = await getStudentProfile();

      if (data.profile) {
        setProfile({
          phone: data.profile.phone || "",
          college: data.profile.college || "",
          degree: data.profile.degree || "",
          branch: data.profile.branch || "",
          graduationYear: data.profile.graduationYear || "",
          bio: data.profile.bio || "",
          careerGoal: data.profile.careerGoal || "",
          interests: data.profile.interests || [],
          skills: data.profile.skills || [],
          certifications: data.profile.certifications || [],
          projects: data.profile.projects || [],
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfile();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const addSkill = () => {
    setProfile((current) => ({
      ...current,
      skills: [...current.skills, { ...emptySkill }],
    }));
  };

  const updateSkill = (index, field, value) => {
    setProfile((current) => ({
      ...current,
      skills: current.skills.map((skill, i) =>
        i === index
          ? {
              ...skill,
              [field]:
                field === "score"
                  ? Number(value)
                  : value,
            }
          : skill
      ),
    }));
  };

  const removeSkill = (index) => {
    setProfile((current) => ({
      ...current,
      skills: current.skills.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const addInterest = () => {
    const value = interestInput.trim();

    if (!value) return;

    if (profile.interests.includes(value)) {
      setInterestInput("");
      return;
    }

    setProfile((current) => ({
      ...current,
      interests: [...current.interests, value],
    }));

    setInterestInput("");
  };

  const removeInterest = (index) => {
    setProfile((current) => ({
      ...current,
      interests: current.interests.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const addCertification = () => {
    setProfile((current) => ({
      ...current,
      certifications: [
        ...current.certifications,
        {
          name: "",
          issuer: "",
          year: "",
        },
      ],
    }));
  };

  const updateCertification = (
    index,
    field,
    value
  ) => {
    setProfile((current) => ({
      ...current,
      certifications: current.certifications.map(
        (item, i) =>
          i === index
            ? { ...item, [field]: value }
            : item
      ),
    }));
  };

  const removeCertification = (index) => {
    setProfile((current) => ({
      ...current,
      certifications:
        current.certifications.filter(
          (_, i) => i !== index
        ),
    }));
  };

  const addProject = () => {
    setProfile((current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          title: "",
          description: "",
          technologies: [],
          link: "",
        },
      ],
    }));
  };

  const updateProject = (
    index,
    field,
    value
  ) => {
    setProfile((current) => ({
      ...current,
      projects: current.projects.map(
        (project, i) =>
          i === index
            ? { ...project, [field]: value }
            : project
      ),
    }));
  };

  const removeProject = (index) => {
    setProfile((current) => ({
      ...current,
      projects: current.projects.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await updateStudentProfile(profile);

      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save your profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page profile-loading">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <button
          className="profile-back"
          onClick={() => navigate("/student")}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>

        <div>
          <p className="profile-eyebrow">
            OPEN COLLAB / STUDENT
          </p>
          <h1>Your Profile</h1>
          <p>
            Build your academic and professional identity.
          </p>
        </div>
      </header>

      <form
        className="profile-form"
        onSubmit={saveProfile}
      >
        {message && (
          <div className="profile-message success">
            {message}
          </div>
        )}

        {error && (
          <div className="profile-message error">
            {error}
          </div>
        )}

        <section className="profile-card">
          <div className="section-heading">
            <div>
              <span>01</span>
              <h2>Academic Information</h2>
            </div>
            <p>
              Tell industries where you are currently studying.
            </p>
          </div>

          <div className="profile-grid">
            <div className="field">
              <label>Phone</label>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="+91..."
              />
            </div>

            <div className="field">
              <label>College</label>
              <input
                name="college"
                value={profile.college}
                onChange={handleChange}
                placeholder="Your college"
              />
            </div>

            <div className="field">
              <label>Degree</label>
              <input
                name="degree"
                value={profile.degree}
                onChange={handleChange}
                placeholder="B.Tech"
              />
            </div>

            <div className="field">
              <label>Branch</label>
              <input
                name="branch"
                value={profile.branch}
                onChange={handleChange}
                placeholder="Computer Science"
              />
            </div>

            <div className="field">
              <label>Graduation Year</label>
              <input
                type="number"
                name="graduationYear"
                value={profile.graduationYear}
                onChange={handleChange}
                placeholder="2027"
              />
            </div>
          </div>
        </section>

        <section className="profile-card">
          <div className="section-heading">
            <div>
              <span>02</span>
              <h2>About You</h2>
            </div>
            <p>
              A short introduction helps companies understand you.
            </p>
          </div>

          <div className="profile-grid single">
            <div className="field">
              <label>Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell us briefly about yourself..."
                rows="4"
              />
            </div>

            <div className="field">
              <label>Career Goal</label>
              <input
                name="careerGoal"
                value={profile.careerGoal}
                onChange={handleChange}
                placeholder="e.g. Full Stack Developer"
              />
            </div>
          </div>
        </section>

        <section className="profile-card">
          <div className="section-heading">
            <div>
              <span>03</span>
              <h2>Skills</h2>
            </div>

            <button
              type="button"
              className="small-action"
              onClick={addSkill}
            >
              <Plus size={15} />
              Add skill
            </button>
          </div>

          <div className="skill-list">
            {profile.skills.length === 0 && (
              <div className="empty-row">
                No skills added yet.
              </div>
            )}

            {profile.skills.map((skill, index) => (
              <div
                className="skill-row"
                key={index}
              >
                <input
                  value={skill.name}
                  onChange={(e) =>
                    updateSkill(
                      index,
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="Python"
                />

                <select
                  value={skill.level}
                  onChange={(e) =>
                    updateSkill(
                      index,
                      "level",
                      e.target.value
                    )
                  }
                >
                  <option value="beginner">
                    Beginner
                  </option>
                  <option value="intermediate">
                    Intermediate
                  </option>
                  <option value="advanced">
                    Advanced
                  </option>
                </select>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={skill.score}
                  onChange={(e) =>
                    updateSkill(
                      index,
                      "score",
                      e.target.value
                    )
                  }
                  placeholder="Score"
                />

                <button
                  type="button"
                  className="delete-button"
                  onClick={() =>
                    removeSkill(index)
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-card">
          <div className="section-heading">
            <div>
              <span>04</span>
              <h2>Interests</h2>
            </div>
          </div>

          <div className="interest-input">
            <input
              value={interestInput}
              onChange={(e) =>
                setInterestInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addInterest();
                }
              }}
              placeholder="e.g. Artificial Intelligence"
            />

            <button
              type="button"
              className="small-action"
              onClick={addInterest}
            >
              <Plus size={15} />
              Add
            </button>
          </div>

          <div className="tag-list">
            {profile.interests.map(
              (interest, index) => (
                <button
                  type="button"
                  className="profile-tag"
                  key={index}
                  onClick={() =>
                    removeInterest(index)
                  }
                >
                  {interest}
                  <span>×</span>
                </button>
              )
            )}
          </div>
        </section>

        <section className="profile-card">
          <div className="section-heading">
            <div>
              <span>05</span>
              <h2>Certifications</h2>
            </div>

            <button
              type="button"
              className="small-action"
              onClick={addCertification}
            >
              <Plus size={15} />
              Add certification
            </button>
          </div>

          <div className="stack-list">
            {profile.certifications.map(
              (certificate, index) => (
                <div
                  className="item-box"
                  key={index}
                >
                  <div className="profile-grid">
                    <div className="field">
                      <label>Name</label>
                      <input
                        value={certificate.name}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Certification name"
                      />
                    </div>

                    <div className="field">
                      <label>Issuer</label>
                      <input
                        value={certificate.issuer}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "issuer",
                            e.target.value
                          )
                        }
                        placeholder="Issuing organization"
                      />
                    </div>

                    <div className="field">
                      <label>Year</label>
                      <input
                        type="number"
                        value={certificate.year}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "year",
                            e.target.value
                          )
                        }
                        placeholder="2026"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="remove-link"
                    onClick={() =>
                      removeCertification(index)
                    }
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              )
            )}
          </div>
        </section>

        <section className="profile-card">
          <div className="section-heading">
            <div>
              <span>06</span>
              <h2>Projects</h2>
            </div>

            <button
              type="button"
              className="small-action"
              onClick={addProject}
            >
              <Plus size={15} />
              Add project
            </button>
          </div>

          <div className="stack-list">
            {profile.projects.map(
              (project, index) => (
                <div
                  className="item-box"
                  key={index}
                >
                  <div className="profile-grid single">
                    <div className="field">
                      <label>Project Title</label>
                      <input
                        value={project.title}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Project name"
                      />
                    </div>

                    <div className="field">
                      <label>Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="What did you build?"
                        rows="3"
                      />
                    </div>

                    <div className="field">
                      <label>Technologies</label>
                      <input
                        value={
                          Array.isArray(
                            project.technologies
                          )
                            ? project.technologies.join(
                                ", "
                              )
                            : project.technologies || ""
                        }
                        onChange={(e) =>
                          updateProject(
                            index,
                            "technologies",
                            e.target.value
                              .split(",")
                              .map((item) =>
                                item.trim()
                              )
                              .filter(Boolean)
                          )
                        }
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>

                    <div className="field">
                      <label>Project Link</label>
                      <input
                        value={project.link}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "link",
                            e.target.value
                          )
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="remove-link"
                    onClick={() =>
                      removeProject(index)
                    }
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              )
            )}
          </div>
        </section>

        <div className="profile-save-area">
          <button
            type="submit"
            className="save-profile"
            disabled={saving}
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentProfile;
