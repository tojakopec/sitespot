import { Link } from "react-router-dom";
import { useAuth } from "@/client/hooks/useAuthStore";

function Navigation() {
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout)
  return (
    <nav className="bg-amber-500 rounded-b-lg text-white p-4 w-full">
      <div className="w-4/5 mx-auto flex justify-between items-center my-auto">
        <Link to="/" className="text-xl font-bold">
          SiteSpot
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <h3>Hi, {user.firstName}</h3>
              <button type="button" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-300">
                Login
              </Link>
              <Link to="/register" className="hover:text-blue-300">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
