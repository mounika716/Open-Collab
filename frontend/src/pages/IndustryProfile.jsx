import { useEffect, useState } from "react";
import { Building2, Save } from "lucide-react";

import {
  getIndustryProfile,
  updateIndustryProfile,
} from "../services/industryApi";

import "./IndustryProfile.css";

function IndustryProfile() {
  const [form, setForm] = useState({
    companyName: "",
    industrySector: "",
    companySize: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    description: "",
    foundedYear: "",
    linkedin: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getIndustryProfile();
        const profile = response.profile || {};

        setForm({
          companyName: profile.companyName || "",
          industrySector: profile.industrySector || "",
          companySize: profile.companySize || "",
          phone: profile.phone || "",
          email: profile.email || "",
          website: profile.website || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          description: profile.description || "",
          foundedYear: profile.foundedYear ?? "",
          linkedin: profile.linkedin || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load industry profile."
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

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await updateIndustryProfile({
        companyName: form.companyName.trim(),
        industrySector: form.industrySector.trim(),
        companySize: form.companySize,
        phone: form.phone.trim(),
        email: form.email.trim(),
        website: form.website.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        description: form.description.trim(),
        foundedYear:
          form.foundedYear === ""
            ? null
            : Number(form.foundedYear),
        linkedin: form.linkedin.trim(),
      });

      setMessage(
        "Industry profile updated successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update industry profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="industry-profile-page">
        <div className="industry-profile-loading">
          Loading industry profile...
        </div>
      </section>
    );
  }

  return (
    <section className="industry-profile-page">
      <div className="industry-profile-header">
        <div className="industry-profile-icon">
          <Building2 size={22} />
        </div>

        <p className="industry-profile-eyebrow">
          INDUSTRY PROFILE
        </p>

        <h1>Build your company profile</h1>

        <p>
          Keep your company details ready for students,
          academicians and collaboration opportunities.
        </p>
      </div>

      {message && (
        <div className="industry-profile-success">
          {message}
        </div>
      )}

      {error && (
        <div className="industry-profile-error">
          {error}
        </div>
      )}

      <form
        className="industry-profile-form"
        onSubmit={handleSubmit}
      >
        <section className="industry-profile-section">
          <div className="industry-section-heading">
            <h2>Company information</h2>
            <p>
              Add the identity and basic information of your
              organization.
            </p>
          </div>

          <div className="industry-profile-grid">
            <div className="industry-field">
              <label>Company name</label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Example Technologies"
                required
              />
            </div>

            <div className="industry-field">
              <label>Industry sector</label>
              <input
                name="industrySector"
                value={form.industrySector}
                onChange={handleChange}
                placeholder="Software & Technology"
              />
            </div>

            <div className="industry-field">
              <label>Company size</label>
              <select
                name="companySize"
                value={form.companySize}
                onChange={handleChange}
              >
                <option value="">Select size</option>
                <option value="startup">Startup</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="enterprise">
                  Enterprise
                </option>
              </select>
            </div>

            <div className="industry-field">
              <label>Founded year</label>
              <input
                type="number"
                name="foundedYear"
                value={form.foundedYear}
                onChange={handleChange}
                placeholder="2020"
              />
            </div>

            <div className="industry-field">
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </div>

            <div className="industry-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="hr@example.com"
              />
            </div>

            <div className="industry-field">
              <label>Website</label>
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="industry-field">
              <label>LinkedIn</label>
              <input
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/..."
              />
            </div>

            <div className="industry-field industry-field-wide">
              <label>Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Office address"
              />
            </div>

            <div className="industry-field">
              <label>City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Hyderabad"
              />
            </div>

            <div className="industry-field">
              <label>State</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Telangana"
              />
            </div>

            <div className="industry-field industry-field-wide">
              <label>Company description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="6"
                maxLength="1500"
                placeholder="Tell students and academic partners about your organization..."
              />
            </div>
          </div>
        </section>

        <div className="industry-profile-actions">
          <button
            className="save-industry-profile-button"
            type="submit"
            disabled={saving}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default IndustryProfile;