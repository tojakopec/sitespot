import { useAuth } from "@client/hooks/useAuthStore";
import AdminDashboard from "./AdminDashboard";
import WorkerDashboard from "./WorkerDashboard";
import ManagerDashboard from "./ManagerDashboard";
import CompanyDashboard from "./CompanyDashboard";
import CompleteRegistration from "../components/auth/CompleteRegistration";

const ROLE_DASHBOARD = {
  ["admin"]: <AdminDashboard />,
  ["worker"]: <WorkerDashboard />,
  ["manager"]: <ManagerDashboard />,
  ["company"]: <CompanyDashboard />,
};

export default function Dashboard() {
  const user = useAuth((state) => state.user);
  if (!user) {
    return;
  }
  const role = user.role;

  if (!user.profileComplete) {
    return <CompleteRegistration />;
  }
  return ROLE_DASHBOARD[role as keyof object];
}
