import "./App.css";
import { Routes, Route } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import Layout from "./components/ui/Layout";
import { useAuth } from "@client/hooks/useAuthStore";
import { useEffect } from "react";
import axios from "axios";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import BrowseJobs from "./pages/BrowseJobs";
import SignUp from "./pages/SignUp";
import RegistrationForm from "./components/auth/RegistrationForm";
import Welcome from "./components/Welcome";
import { getCsrfToken } from "./utils/getCsrfToken";
const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const token = useAuth((state) => state.token);
  const logout = useAuth((state) => state.logout);
  const user = useAuth((state) => state.user);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const { csrfToken } = await getCsrfToken();

        const validateResponse = await axios.get(`${API_URL}/auth/validate`, {
          headers: {
            "X-CSRF-Token": csrfToken,
            Authorization: `Bearer ${token}`,
            withCredentials: true,
          },
        });

        if (!validateResponse.data.valid) logout();
      } catch (error) {
        console.log("Validation error: ", error);
        logout();
      }
    };

    if (token) {
      validateSession();
    }
  }, [token, logout]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Welcome />} />
        <Route path="auth" element={<SignUp />}>
          <Route index path="register" element={<RegistrationForm />} />
          <Route path="login" element={<LoginForm />} />
        </Route>
        <Route element={<ProtectedRoute isAllowed={!!user} />}>
          <Route path="home" element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
        <Route element={<ProtectedRoute isAllowed={!!user} />}>
          <Route path="jobs" element={<BrowseJobs />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
