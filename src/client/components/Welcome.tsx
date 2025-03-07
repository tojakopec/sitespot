import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-2xl font-bold mb-4">Welcome to SiteSpot</h1>
      <p className="mb-4">
        Please{" "}
        <Link to="/login" className="text-blue-500 hover:text-blue-600">
          login
        </Link>{" "}
        or{" "}
        <Link to="/register" className="text-blue-500 hover:text-blue-600">
          register
        </Link>{" "}
        to continue
      </p>
    </div>
  );
}
