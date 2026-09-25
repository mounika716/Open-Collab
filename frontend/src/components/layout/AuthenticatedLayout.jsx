import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import GooeyNav from "../navigation/GooeyNav";

import "./AuthenticatedLayout.css";

function AuthenticatedLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getItems = () => {
    if (user?.role === "student") {
      return [
        { label: "Dashboard", href: "/student" },
        { label: "Profile", href: "/student/profile" },
        { label: "Skills", href: "/student/skills" },
        { label: "Internships", href: "/student/internships" },
        { label: "Jobs", href: "/student/jobs" },
        { label: "Applications", href: "/student/applications" },
        {
          label: "Collab Opportunities",
          href: "/student/collaboration-opportunities",
        },
        {
          label: "My Collaborations",
          href: "/student/collaborations",
        },
      ];
    }

    if (user?.role === "industry") {
      return [
        { label: "Dashboard", href: "/industry" },
        { label: "Profile", href: "/industry/profile" },
        { label: "Internships", href: "/industry/internships" },
        { label: "Jobs", href: "/industry/jobs" },
        {
          label: "Job Candidates",
          href: "/industry/job-candidates",
        },
        { label: "Candidates", href: "/industry/candidates" },
      ];
    }

    if (user?.role === "academician") {
      return [
        { label: "Dashboard", href: "/academician" },
        { label: "Profile", href: "/academician/profile" },
        {
          label: "Opportunities",
          href: "/academician/opportunities",
        },
        {
          label: "Training & FDP",
          href: "/academician/training",
        },
        {
          label: "Consultancy",
          href: "/academician/consultancy",
        },
        {
          label: "Research",
          href: "/academician/research",
        },
      ];
    }

    if (user?.role === "institution") {
      return [
        { label: "Dashboard", href: "/institution" },
        { label: "Profile", href: "/institution/profile" },
        { label: "Analytics", href: "/institution/analytics" },
      ];
    }

    if (user?.role === "admin") {
      return [
        { label: "Dashboard", href: "/admin" },
        { label: "Users", href: "/admin/users" },
        { label: "Internships", href: "/admin/internships" },
      ];
    }

    return [];
  };

  return (
    <div className="authenticated-layout">
      <header className="authenticated-nav">

        <div className="authenticated-brand">
          <div className="authenticated-logo">
            OC
          </div>

          <span>Open Collab</span>
        </div>

        <GooeyNav
          items={getItems()}
          particleCount={12}
          particleDistances={[80, 10]}
          particleR={90}
          animationTime={500}
          timeVariance={250}
          initialActiveIndex={0}
          colors={[1, 2, 3, 1, 2, 3, 4]}
        />

        <button
          className="logout-button"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>

      </header>

      <main className="authenticated-content">
        {children}
      </main>
    </div>
  );
}

export default AuthenticatedLayout;