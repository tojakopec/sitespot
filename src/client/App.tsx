import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import RegistrationForm from "./components/auth/RegistrationForm";
import Layout from "./components/ui/Layout";
import { useAuth } from "@client/hooks/useAuthStore";
import { useEffect } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const token = useAuth((state) => state.token);
  const logout = useAuth((state) => state.logout);
  const user = useAuth((state) => state.user);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const csrfResponse = await axios.get(`${API_URL}/csrf-token`, {
          withCredentials: true,
        });
        const csrfToken = csrfResponse.data.csrfToken;

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
        <Route
          index
          element={
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
              <h1 className="text-2xl font-bold mb-4">Welcome to SiteSpot</h1>
              {user ? (
                <p>Welcome, {user.firstName}!</p>
              ) : (
                <p>Still not logged in</p>
              )}
              <p className="mb-4">
                Please{" "}
                <Link to="/login" className="text-blue-500 hover:text-blue-600">
                  login
                </Link>{" "}
                or{" "}
                <Link
                  to="/register"
                  className="text-blue-500 hover:text-blue-600"
                >
                  register
                </Link>{" "}
                to continue
              </p>
            </div>
          }
        />
        <Route path="login" element={<LoginForm />} />
        <Route path="register" element={<RegistrationForm />} />
      </Route>
    </Routes>
  );
}

export default App;
