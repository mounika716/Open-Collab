import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
  children,
  role,
  allowIncomplete = false,
}) {
  const {
    user,
    isAuthenticated,
    getPostAuthPath,
  } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  // Admin users do not need onboarding.
  if (user?.role === "admin") {
    return children;
  }

  // Allow the onboarding page itself to load.
  if (allowIncomplete) {
    if (user?.onboardingCompleted !== false) {
      return (
        <Navigate
          to={getPostAuthPath(user)}
          replace
        />
      );
    }

    return children;
  }

  // New users must complete onboarding before
  // accessing their normal protected pages.
  if (user?.onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

export default ProtectedRoute;