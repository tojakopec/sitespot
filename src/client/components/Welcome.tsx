import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@client/hooks/useAuthStore";
export default function Welcome() {
  const user = useAuth((state) => state.user);
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] mx-auto">
      <h1 className="text-4xl font-bold mb-4">Welcome to SiteSpot</h1>
      <p className="text-lg mb-4">
        Please{" "}
        <Link to="/auth/login" className="text-blue-500 hover:text-blue-600">
          login
        </Link>{" "}
        or{" "}
        <Link to="/auth/register" className="text-blue-500 hover:text-blue-600">
          register
        </Link>{" "}
        to continue
      </p>
    </div>
  );
}
