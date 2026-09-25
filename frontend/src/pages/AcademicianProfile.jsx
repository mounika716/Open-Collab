import { useEffect, useState } from "react";
import { Save, UserRound } from "lucide-react";

import {
  getAcademicianProfile,
  updateAcademicianProfile,
} from "../services/academicianApi";

import "./AcademicianProfile.css";

function AcademicianProfile() {
  const [form, setForm] = useState({
    phone: "",
    institution: "",
    department: "",
    designation: "",
    specialization: "",
    qualifications: "",
    experienceYears: "",
    bio: "",
    areasOfInterest: "",
    linkedin: "",
    website: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getAcademicianProfile();
        const profile = response.profile || {};

        setForm({
          phone: profile.phone || "",
          institution: profile.institution || "",
          department: profile.department || "",
          designation: profile.designation || "",
          specialization: profile.specialization || "",
          qualifications:
            profile.qualifications?.join(", ") || "",
          experienceYears:
            profile.experienceYears ?? "",
          bio: profile.bio || "",
          areasOfInterest:
            profile.areasOfInterest?.join(", ") || "",
          linkedin: profile.linkedin || "",
          website: profile.website || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const profileData = {
        phone: form.phone.trim(),
        institution: form.institution.trim(),
        department: form.department.trim(),
        designation: form.designation.trim(),
        specialization: form.specialization.trim(),
        qualifications: form.qualifications
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        experienceYears:
          form.experienceYears === ""
            ? 0
            : Number(form.experienceYears),
        bio: form.bio.trim(),
        areasOfInterest: form.areasOfInterest
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        linkedin: form.linkedin.trim(),
        website: form.website.trim(),
      };

      await updateAcademicianProfile(profileData);

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="academician-profile-page">
        <div className="profile-loading">
          Loading your profile...
        </div>
      </section>
    );
  }

  return (
    <section className="academician-profile-page">
      <div className="academician-profile-header">
        <div>
          <div className="profile-icon">
            <UserRound size={22} />
          </div>

          <p className="profile-eyebrow">
            ACADEMICIAN PROFILE
          </p>

          <h1>Your academic profile</h1>

          <p>
            Keep your professional information updated for
            industry and academic collaboration.
          </p>
        </div>
      </div>

      {message && (
        <div className="profile-success">
          {message}
        </div>
      )}

      {error && (
        <div className="profile-error">
          {error}
        </div>
      )}

      <form
        className="academician-profile-form"
        onSubmit={handleSubmit}
      >
        <div className="profile-section">
          <div className="section-heading">
            <h2>Professional information</h2>
            <p>
              Tell the Open Collab network about your academic
              background.
            </p>
          </div>

          <div className="profile-grid">
            <div className="profile-field">
              <label>Institution</label>
              <input
                name="institution"
                value={form.institution}
                onChange={handleChange}
                placeholder="ABC Engineering College"
              />
            </div>

            <div className="profile-field">
              <label>Department</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Computer Science and Engineering"
              />
            </div>

            <div className="profile-field">
              <label>Designation</label>
              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="Assistant Professor"
              />
            </div>

            <div className="profile-field">
              <label>Specialization</label>
              <input
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Artificial Intelligence"
              />
            </div>

            <div className="profile-field">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </div>

            <div className="profile-field">
              <label>Experience (years)</label>
              <input
                type="number"
                name="experienceYears"
                min="0"
                value={form.experienceYears}
                onChange={handleChange}
                placeholder="5"
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <div className="section-heading">
            <h2>Qualifications & interests</h2>
            <p>
              Separate multiple entries with commas.
            </p>
          </div>

          <div className="profile-grid">
            <div className="profile-field profile-field-wide">
              <label>Qualifications</label>
              <input
                name="qualifications"
                value={form.qualifications}
                onChange={handleChange}
                placeholder="M.Tech in CSE, B.Tech in CSE"
              />
            </div>

            <div className="profile-field profile-field-wide">
              <label>Areas of interest</label>
              <input
                name="areasOfInterest"
                value={form.areasOfInterest}
                onChange={handleChange}
                placeholder="AI, Machine Learning, Data Science"
              />
            </div>

            <div className="profile-field profile-field-wide">
              <label>Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows="5"
                maxLength="1000"
                placeholder="Briefly describe your academic and professional experience."
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <div className="section-heading">
            <h2>Professional links</h2>
            <p>
              Add links that help collaborators learn more
              about your work.
            </p>
          </div>

          <div className="profile-grid">
            <div className="profile-field">
              <label>LinkedIn</label>
              <input
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/your-name"
              />
            </div>

            <div className="profile-field">
              <label>Website</label>
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button
            type="submit"
            className="save-profile-button"
            disabled={saving}
          >
            <Save size={17} />

            {saving
              ? "Saving..."
              : "Save profile"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AcademicianProfile;
