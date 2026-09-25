import { useEffect, useState } from "react";
import { Building2, Save } from "lucide-react";

import {
  getInstitutionProfile,
  updateInstitutionProfile,
} from "../services/institutionApi";

import "./InstitutionProfile.css";

function InstitutionProfile() {
  const [form, setForm] = useState({
    institutionName: "",
    institutionType: "college",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    description: "",
    establishedYear: "",
    affiliation: "",
    accreditation: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getInstitutionProfile();
        const profile = response.profile || {};

        setForm({
          institutionName: profile.institutionName || "",
          institutionType:
            profile.institutionType || "college",
          phone: profile.phone || "",
          email: profile.email || "",
          website: profile.website || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          description: profile.description || "",
          establishedYear:
            profile.establishedYear ?? "",
          affiliation: profile.affiliation || "",
          accreditation:
            profile.accreditation?.join(", ") || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load institution profile."
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
        institutionName: form.institutionName.trim(),
        institutionType: form.institutionType,
        phone: form.phone.trim(),
        email: form.email.trim(),
        website: form.website.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        description: form.description.trim(),
        establishedYear:
          form.establishedYear === ""
            ? undefined
            : Number(form.establishedYear),
        affiliation: form.affiliation.trim(),
        accreditation: form.accreditation
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      await updateInstitutionProfile(profileData);

      setMessage("Institution profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update institution profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="institution-profile-page">
        <div className="institution-profile-loading">
          Loading institution profile...
        </div>
      </section>
    );
  }

  return (
    <section className="institution-profile-page">
      <div className="institution-profile-header">
        <div className="institution-profile-icon">
          <Building2 size={22} />
        </div>

        <p className="institution-profile-eyebrow">
          INSTITUTION PROFILE
        </p>

        <h1>Build your institution profile</h1>

        <p>
          Keep your institution information ready for students,
          industry partners, faculty programs and academic
          collaboration.
        </p>
      </div>

      {message && (
        <div className="institution-profile-success">
          {message}
        </div>
      )}

      {error && (
        <div className="institution-profile-error">
          {error}
        </div>
      )}

      <form
        className="institution-profile-form"
        onSubmit={handleSubmit}
      >
        <div className="institution-profile-section">
          <div className="institution-section-heading">
            <h2>Institution information</h2>
            <p>
              Add the basic identity and type of your institution.
            </p>
          </div>

          <div className="institution-profile-grid">
            <div className="institution-field">
              <label>Institution name</label>
              <input
                name="institutionName"
                value={form.institutionName}
                onChange={handleChange}
                placeholder="ABC Engineering College"
                required
              />
            </div>

            <div className="institution-field">
              <label>Institution type</label>
              <select
                name="institutionType"
                value={form.institutionType}
                onChange={handleChange}
              >
                <option value="university">University</option>
                <option value="college">College</option>
                <option value="engineering_college">
                  Engineering College
                </option>
                <option value="degree_college">
                  Degree College
                </option>
                <option value="polytechnic">
                  Polytechnic
                </option>
                <option value="training_institute">
                  Training Institute
                </option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="institution-field">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </div>

            <div className="institution-field">
              <label>Institution email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="contact@college.edu"
              />
            </div>

            <div className="institution-field">
              <label>Website</label>
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://college.edu"
              />
            </div>

            <div className="institution-field">
              <label>Established year</label>
              <input
                type="number"
                name="establishedYear"
                min="1000"
                max="2100"
                value={form.establishedYear}
                onChange={handleChange}
                placeholder="2005"
              />
            </div>
          </div>
        </div>

        <div className="institution-profile-section">
          <div className="institution-section-heading">
            <h2>Location</h2>
            <p>
              Help students and industry partners understand
              where your institution operates.
            </p>
          </div>

          <div className="institution-profile-grid">
            <div className="institution-field institution-field-wide">
              <label>Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                placeholder="Institution address"
              />
            </div>

            <div className="institution-field">
              <label>City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Hyderabad"
              />
            </div>

            <div className="institution-field">
              <label>State</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Telangana"
              />
            </div>
          </div>
        </div>

        <div className="institution-profile-section">
          <div className="institution-section-heading">
            <h2>Academic identity</h2>
            <p>
              Add affiliation, accreditation and a short
              institutional description.
            </p>
          </div>

          <div className="institution-profile-grid">
            <div className="institution-field">
              <label>Affiliation</label>
              <input
                name="affiliation"
                value={form.affiliation}
                onChange={handleChange}
                placeholder="JNTUH"
              />
            </div>

            <div className="institution-field">
              <label>Accreditation</label>
              <input
                name="accreditation"
                value={form.accreditation}
                onChange={handleChange}
                placeholder="NAAC A, NBA CSE"
              />
            </div>

            <div className="institution-field institution-field-wide">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="5"
                maxLength="1500"
                placeholder="Describe your institution, departments, academic strengths and collaboration interests."
              />
            </div>
          </div>
        </div>

        <div className="institution-profile-actions">
          <button
            type="submit"
            className="save-institution-profile-button"
            disabled={saving}
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default InstitutionProfile;
