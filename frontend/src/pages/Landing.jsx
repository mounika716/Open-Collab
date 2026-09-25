import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

import GalaxyBackground from "../components/background/GalaxyBackground";

import "./Landing.css";

function Landing() {
  return (
    <main className="landing">
      <div className="landing-galaxy">
        <GalaxyBackground />
      </div>

      <div className="landing-content">

      {/* Navigation */}
      <nav className="landing-nav">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>

          <span>Open Collab</span>
        </Link>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#for-students">Students</a>
          <a href="#for-industry">Industry</a>
        </div>

        <Link to="/login" className="nav-login">
          Sign in
        </Link>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={15} />
            Academia meets Industry
          </div>

          <h1 className="target-heading hero-title cursor-target" >
            Turn your skills into
            <span> opportunities.</span>
          </h1>

          <p className="hero-description">
            Open Collab connects students, skills, learning and industry
            opportunities in one intelligent platform.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="primary-button">
              Get Started
              <ArrowRight size={18} />
            </Link>

            <a href="#features" className="secondary-button">
              Explore platform
            </a>
          </div>

          <div className="hero-note">
            <ShieldCheck size={16} />
            Built around skills, not just resumes.
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section">
        <div className="section-heading">
          <p className="eyebrow">ONE PLATFORM</p>

          <h2 className="target-heading cursor-target">
            Everything you need to move forward.
          </h2>

          <p>
            From discovering your strengths to finding the right industry
            opportunity, Open Collab brings the complete journey together.
          </p>
        </div>

        <div className="feature-grid">
          <FeatureCard
            icon={<Target />}
            title="Skill Profiling"
            text="Build a meaningful profile around your technical and soft skills."
          />

          <FeatureCard
            icon={<BrainCircuit />}
            title="Smart Assessment"
            text="Discover strengths and identify the skills you need to improve."
          />

          <FeatureCard
            icon={<ChartNoAxesCombined />}
            title="Skill Gap Analysis"
            text="Understand exactly where you stand and what to work on next."
          />

          <FeatureCard
            icon={<GraduationCap />}
            title="Personalized Learning"
            text="Get learning recommendations aligned with your career goals."
          />

          <FeatureCard
            icon={<BriefcaseBusiness />}
            title="Internship Opportunities"
            text="Find opportunities based on your skills and interests."
          />

          <FeatureCard
            icon={<Users />}
            title="Industry Matching"
            text="Connect students and organizations through skill-based matching."
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section workflow-section">
        <div className="section-heading">
          <p className="eyebrow">HOW IT WORKS</p>

          <h2 className="target-heading cursor-target">
            From potential to opportunity.
          </h2>
        </div>

        <div className="steps">
          <Step
            number="01"
            title="Create your profile"
            text="Tell us about your skills, interests, projects and career goals."
          />

          <Step
            number="02"
            title="Understand your gaps"
            text="Assess your abilities and discover the skills that need attention."
          />

          <Step
            number="03"
            title="Build your skills"
            text="Follow personalized learning and certification recommendations."
          />

          <Step
            number="04"
            title="Connect with industry"
            text="Discover internships and opportunities that match your profile."
          />
        </div>
      </section>

      {/* Student */}
      <section id="for-students" className="split-section">
        <div>
          <p className="eyebrow">FOR STUDENTS</p>

          <h2 className="target-heading cursor-target">
            Don't just search for opportunities.
            <span> Become ready for them.</span>
          </h2>

          <p>
            Open Collab helps students understand their current capabilities,
            improve their weak areas and create a stronger path toward
            internships and careers.
          </p>

          <Link to="/register" className="text-link">
            Build your profile <ArrowRight size={17} />
          </Link>
        </div>

        <div className="visual-card">
          <div className="mini-card">
            <span>Skill readiness</span>
            <strong>78%</strong>
            <div className="progress">
              <div style={{ width: "78%" }} />
            </div>
          </div>

          <div className="mini-card">
            <span>Recommended</span>
            <strong>12 opportunities</strong>
          </div>

          <div className="mini-card">
            <span>Skill gap</span>
            <strong>3 areas to improve</strong>
          </div>
        </div>
      </section>

      {/* Industry */}
      <section id="for-industry" className="split-section industry-section">
        <div className="visual-card industry-card">
          <div className="match-card">
            <div>
              <span>Candidate match</span>
              <strong>94%</strong>
            </div>

            <div className="match-bar">
              <div />
            </div>
          </div>

          <div className="match-card">
            <span>Required skills</span>

            <div className="skill-pills">
              <span>React</span>
              <span>Python</span>
              <span>SQL</span>
              <span>Git</span>
            </div>
          </div>
        </div>

        <div>
          <p className="eyebrow">FOR INDUSTRY</p>

          <h2 className="target-heading cursor-target">
            Find people by what they can
            <span> actually do.</span>
          </h2>

          <p>
            Post internships, define required skills and discover candidates
            whose capabilities align with your real requirements.
          </p>

          <Link to="/register" className="text-link">
            Join as industry <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <p className="eyebrow">READY TO BEGIN?</p>

        <h2 className="target-heading cursor-target">
          Your next opportunity starts with
          <span> understanding your skills.</span>
        </h2>

        <Link to="/login" className="primary-button">
          Get Started
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">
              <Sparkles size={17} />
            </span>

            <span>Open Collab</span>
          </div>

          <p>
            Connecting academia, skills and industry.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <strong>Platform</strong>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
          </div>

          <div>
            <strong>Access</strong>
            <Link to="/login">Sign in</Link>
            <Link to="/register">Create account</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Open Collab</span>
          <span>Built for Academia × Industry collaboration</span>
        </div>
      </footer>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <article className="feature-card">
      <div className="feature-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{text}</p>
    </article>
  );
}

function Step({ number, title, text }) {
  return (
    <article className="step">
      <span>{number}</span>

      <h3>{title}</h3>

      <p>{text}</p>
    </article>
  );
}

export default Landing;