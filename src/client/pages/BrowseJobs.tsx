import { useAuth } from "@client/hooks/useAuthStore";
import { Navigate } from "react-router-dom";
import CreateJob from "./CreateJob";

export default function BrowseJobs() {
  const user = useAuth((state) => state.user);
  if (!user) {
    return <Navigate to="/login" />;
  }
  const userRole = user.role;
  const canCreateJob = userRole === "manager" || userRole === "company";
  return (
    <>
      {canCreateJob ? <CreateJob /> : null}
      <div>
        <h2 className="text-2xl font-bold">Browse Jobs</h2>
      </div>
    </>
  );
}
