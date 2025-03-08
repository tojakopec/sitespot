import { AuthState } from "@client/hooks/useAuthStore";
import AdminDashboard from "./AdminDashboard";
import WorkerDashboard from "./WorkerDashboard";
import ManagerDashboard from "./ManagerDashboard";
import CompanyDashboard from "./CompanyDashboard";

interface DashboardProps {
  user: AuthState["user"];
}

const ROLE_DASHBOARD = {
  ["admin"]: <AdminDashboard />,
  ["worker"]: <WorkerDashboard />,
  ["manager"]: <ManagerDashboard />,
  ["company"]: <CompanyDashboard />,
};

export default function Dashboard({ user }: DashboardProps) {
  if (!user) {
    return;
  }
  const role = user.role;
  return ROLE_DASHBOARD[role as keyof object];
}
