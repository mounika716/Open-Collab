import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./OAuthRoleSelection.css";

const roles = [
  {
    value: "student",
    title: "Student",
    description:
      "Build your skill profile, discover internships, take assessments and prepare for your career.",
    icon: "🎓",
  },
  {
    value: "industry",
    title: "Industry",
    description:
      "Find skilled candidates, publish internships and jobs, and collaborate with academia.",
    icon: "🏢",
  },
  {
    value: "academician",
    title: "Academician",
    description:
      "Connect students with opportunities, training, research and industry collaboration.",
    icon: "👨‍🏫",
  },
  {
    value: "institution",
    title: "Institution",
    description:
      "Manage institutional opportunities, analytics and academia-industry engagement.",
    icon: "🏛️",
  },
];

function OAuthRoleSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
  setOAuthSession,
  getPostAuthPath,
} = useAuth();

  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pendingToken = searchParams.get("token");

  const handleContinue = async () => {
    if (!selectedRole) {
      setError("Please select how you will use Open Collab.");
      return;
    }

    if (!pendingToken) {
      setError(
        "Your registration session is missing or invalid. Please sign in again."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        "/auth/oauth/complete",
        {
          token: pendingToken,
          role: selectedRole,
        }
      );

      const {
        token,
        user,
      } = response.data;

      setOAuthSession(token, user);

      window.history.replaceState(
        {},
        document.title,
        "/oauth/role"
      );

      navigate(getPostAuthPath(user), {
        replace: true,
        });
    } catch (requestError) {
      console.error(
        "OAuth role selection error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to complete registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="oauth-role-page">
      <div className="oauth-role-card">
        <div className="oauth-role-brand">
          <span className="oauth-role-brand-mark">
            OC
          </span>

          <span>Open Collab</span>
        </div>

        <div className="oauth-role-header">
          <span className="oauth-role-kicker">
            ONE LAST STEP
          </span>

          <h1>
            How will you use
            <br />
            <span>Open Collab?</span>
          </h1>

          <p>
            Choose your role to personalize your
            Open Collab experience.
          </p>
        </div>

        <div className="oauth-role-grid">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              className={`oauth-role-option ${
                selectedRole === role.value
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedRole(role.value)
              }
              disabled={loading}
            >
              <div className="oauth-role-icon">
                {role.icon}
              </div>

              <div className="oauth-role-content">
                <h2>{role.title}</h2>

                <p>{role.description}</p>
              </div>

              <div className="oauth-role-radio">
                {selectedRole === role.value
                  ? "✓"
                  : ""}
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="oauth-role-error">
            {error}
          </div>
        )}

        <button
          type="button"
          className="oauth-role-continue"
          onClick={handleContinue}
          disabled={loading}
        >
          {loading
            ? "Creating your account..."
            : "Continue"}
        </button>

        <p className="oauth-role-note">
          You can use Open Collab according to the
          role selected for this account.
        </p>
      </div>
    </div>
  );
}

export default OAuthRoleSelection;