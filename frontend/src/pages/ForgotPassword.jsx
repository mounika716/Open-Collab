import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, ArrowRight } from "lucide-react";

import GalaxyBackground from "../components/background/GalaxyBackground";

import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email) return;

    setSubmitted(true);
  };

  return (
    <main className="forgot-page">

      <div className="forgot-galaxy">
        <GalaxyBackground
          transparent
          mouseInteraction
          density={1.15}
          glowIntensity={0.28}
          saturation={0}
          hueShift={0}
          twinkleIntensity={0.35}
          rotationSpeed={0.03}
          repulsionStrength={0.5}
          autoCenterRepulsion={0}
          starSpeed={0.3}
          speed={0.5}
        />
      </div>

      <div className="forgot-overlay" />

      <Link to="/login" className="forgot-back">
        <ArrowLeft size={17} />
        Back to Sign In
      </Link>

      <section className="forgot-content">
        <div className="forgot-card">

          <div className="forgot-icon">
            <Mail size={25} />
          </div>

          {!submitted ? (
            <>
              <h1 className="target-heading cursor-target">
                Reset <span>Password</span>
              </h1>

              <p>
                Enter your registered email address and we'll
                help you get back into your account.
              </p>

              <form onSubmit={handleSubmit}>

                <label htmlFor="reset-email">
                  Email address
                </label>

                <div className="forgot-input">
                  <Mail size={18} />

                  <input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                  />
                </div>

                <button type="submit">
                  Send Reset Link
                  <ArrowRight size={18} />
                </button>

              </form>
            </>
          ) : (
            <div className="forgot-success">
              <h1>
                Check your <span>email</span>
              </h1>

              <p>
                If an account exists for{" "}
                <strong>{email}</strong>, a password
                reset link will be sent there.
              </p>

              <Link to="/login">
                Return to Sign In
              </Link>
            </div>
          )}

        </div>
      </section>

    </main>
  );
}

export default ForgotPassword;