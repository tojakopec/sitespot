import { useAuth } from "@/client/hooks/useAuthStore";
import { Navigate } from "react-router-dom";
import CompleteManagerProfile from "../CompleteManagerProfile";
import CompleteWorkerProfile from "../CompleteWorkerProfile";
import CompleteCompanyProfile from "../CompleteCompanyProfile";
export default function CompleteRegistration() {
  const user = useAuth((state) => state.user);
  const role = user?.role ?? "worker";

  if (!user) {
    console.log("User not found");
    return <Navigate to="/auth/login" />;
  }
  if (user.profileComplete) {
    return <Navigate to="/dashboard" />;
  }
  return (
    <div className="flex flex-col items-center justify-center mx-auto">
      <h1 id="complete-profile-title" className="text-4xl font-bold mt-4">
        Complete your profile
      </h1>
      {role === "manager" && <CompleteManagerProfile />}
      {role === "worker" && <CompleteWorkerProfile />}
      {role === "company" && <CompleteCompanyProfile />}
    </div>
  );
}
