import "./App.css";
import LoginForm from "./components/auth/LoginForm";
import RegistrationForm from "./components/auth/RegistrationForm";

function App() {
  return (
    <div className="flex flex-row gap-4">
      <RegistrationForm />
      <LoginForm />
    </div>
  );
}

export default App;
