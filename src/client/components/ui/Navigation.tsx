import { Link } from "react-router-dom";

function Navigation() {
  return (
    <nav className="bg-amber-500 rounded-b-lg text-white p-4 w-full">
      <div className="w-4/5 mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          SiteSpot
        </Link>
        <div className="flex gap-4">
          <Link to="/login" className="hover:text-blue-300">
            Login
          </Link>
          <Link to="/register" className="hover:text-blue-300">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
