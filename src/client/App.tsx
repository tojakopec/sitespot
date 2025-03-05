import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import RegistrationForm from "./components/auth/RegistrationForm";
import Layout from "./components/ui/Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <div className="flex flex-col items-center justify-center min-h-[80vh]">
              <h1 className="text-2xl font-bold mb-4">Welcome to SiteSpot</h1>
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
